/**
 * Tiny self-contained sound engine using the Web Audio API.
 *
 * No audio files needed — every effect is synthesized on the fly. Two
 * concerns live here:
 *
 *   1. SFX blips  — `sounds.{click,pop,celebrate,whoosh,twinkle,sparkle}`
 *   2. Ambient pad — `setAmbient(enabled)` builds a gentle, evolving chord
 *      (a few detuned oscillators → lowpass → slow LFO → master gain) that
 *      supplies the app's on-brand "magical" background hum. No binary asset.
 *
 * `muted` gates everything: when muted, SFX are silent and the pad is not
 * running (or fades back out). The store-driven audio toggle is the single
 * source of truth; callers keep it in sync via `setAmbient` + `setMuted`.
 */

let ctx: AudioContext | null = null;
let muted = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Resume the AudioContext after a user gesture (autoplay unlock). */
export function unlockAudio() {
  void getCtx()?.resume();
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("sound-muted", value ? "1" : "0");
  }
  if (!value) {
    void getCtx()?.resume();
    // If the ambient pad was requested while muted, bring it up now.
    if (ambient.wanted && !ambient.running) startAmbient();
  } else {
    // Muting pulls the pad back down so it's not audible.
    teardownAmbient(1200);
  }
}

export function initMutedFromStorage() {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem("sound-muted");
  muted = stored !== "0";
}

/* ---------------------------------------------------------------------------
 * SFX — short synthesized blips.
 * ------------------------------------------------------------------------- */

function tone(freq: number, duration: number, type: OscillatorType, when = 0, gain = 0.08) {
  const audio = getCtx();
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  const start = audio.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A quick upward arpeggio of two sine swells — a soft twinkle. */
function arp(freqs: number[], step: number, type: OscillatorType, gain: number, duration: number) {
  freqs.forEach((f, i) => tone(f, duration, type, i * step, gain));
}

export const sounds = {
  click: () => tone(660, 0.12, "sine"),
  pop: () => tone(880, 0.15, "triangle"),
  /** Celebratory ascending triad — used at big payoff moments. */
  celebrate: () => {
    tone(523, 0.15, "triangle", 0);
    tone(659, 0.15, "triangle", 0.12);
    tone(784, 0.2, "triangle", 0.24);
    tone(1046, 0.3, "triangle", 0.38);
  },
  /** A soft whoosh — a quick filter-swept noise-ish burst via fast detuned sines. */
  whoosh: () => {
    arp([330, 440, 587], 0.05, "sine", 0.05, 0.22);
  },
  /** A gentle two-note twinkle — hover/peek moments. */
  twinkle: () => {
    tone(1318, 0.16, "triangle", 0, 0.06);
    tone(1760, 0.18, "sine", 0.08, 0.05);
  },
  /** A bright sparkle — cursor trail / decorative flicker. */
  sparkle: () => {
    tone(2093, 0.1, "sine", 0, 0.04);
    tone(2637, 0.12, "triangle", 0.05, 0.035);
  },
};

/* ---------------------------------------------------------------------------
 * Ambient pad — a slow, dreamy chord that breathes in the background.
 * Built lazily; start/stop interleaved cleanly with `muted`.
 * ------------------------------------------------------------------------- */

interface AmbientState {
  wanted: boolean; // caller asked for the pad to be audible
  running: boolean; // the graph is alive right now
  master: GainNode | null;
  sources: OscillatorNode[];
  nodes: AudioNode[];
  teardown: number | null; // pending teardown timeout
  lfoInterval: number | null; // JS-driven slow modulation timer
}

const ambient: AmbientState = {
  wanted: false,
  running: false,
  master: null,
  sources: [],
  nodes: [],
  teardown: null,
  lfoInterval: null,
};

/** The voices of the pad — a warm A-minor-ish stack with an airy top. */
const PAD_VOICES: Array<{ freq: number; type: OscillatorType; detune: number; gain: number }> = [
  { freq: 130.81, type: "sine", detune: -5, gain: 0.9 }, // C3
  { freq: 196.0, type: "sine", detune: 5, gain: 0.75 }, // G3
  { freq: 261.63, type: "triangle", detune: -3, gain: 0.42 }, // C4
  { freq: 392.0, type: "sine", detune: 4, gain: 0.22 }, // G4 (airy)
];

function teardownAmbient(fadeMs: number) {
  if (!ambient.running) return;
  const audio = getCtx();
  if (audio && ambient.master) {
    // Fade the master out, then stop/disconnect the nodes a beat later.
    const now = audio.currentTime;
    try {
      ambient.master.gain.cancelScheduledValues(now);
      ambient.master.gain.setValueAtTime(Math.max(ambient.master.gain.value, 0.0001), now);
      ambient.master.gain.exponentialRampToValueAtTime(0.0001, now + fadeMs / 1000);
    } catch {
      /* ignore */
    }
  }
  if (ambient.lfoInterval !== null) {
    window.clearInterval(ambient.lfoInterval);
    ambient.lfoInterval = null;
  }
  ambient.running = false; // considered stopped for `startAmbient` purposes
  if (ambient.teardown !== null) window.clearTimeout(ambient.teardown);
  ambient.teardown = window.setTimeout(() => {
    for (const osc of ambient.sources) {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }
    for (const n of ambient.nodes) {
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
    ambient.sources = [];
    ambient.nodes = [];
    ambient.master = null;
    ambient.teardown = null;
  }, fadeMs);
}

function startAmbient() {
  if (ambient.running) return;
  const audio = getCtx();
  if (!audio) return;

  // Cancel any in-flight teardown so a quick restart doesn't yank nodes.
  if (ambient.teardown !== null) {
    window.clearTimeout(ambient.teardown);
    ambient.teardown = null;
    for (const osc of ambient.sources) {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    }
    for (const n of ambient.nodes) {
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
    ambient.sources = [];
    ambient.nodes = [];
    ambient.master = null;
  }

  const now = audio.currentTime;

  // Master gain — fades in slowly so the pad never clicks in.
  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.09, now + 2.5);
  master.connect(audio.destination);
  ambient.master = master;
  ambient.nodes.push(master);

  // Lowpass with a slow LFO on the cutoff — the pad "breathes" timbrally.
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(700, now);
  filter.Q.value = 0.6;
  filter.connect(master);
  ambient.nodes.push(filter);

  for (const v of PAD_VOICES) {
    const osc = audio.createOscillator();
    osc.type = v.type;
    osc.frequency.setValueAtTime(v.freq, now);
    osc.detune.value = v.detune;
    const vg = audio.createGain();
    vg.gain.value = v.gain * 0.5;
    osc.connect(vg).connect(filter);
    osc.start(now);
    ambient.sources.push(osc);
    ambient.nodes.push(osc, vg);
  }

  // Slow JS LFO modulating filter cutoff — keeps the timbre alive without a
  // dedicated LFO oscillator node. ~11s cycle, very gentle.
  ambient.lfoInterval = window.setInterval(() => {
    if (!audio || muted) return;
    const t = audio.currentTime;
    const wobble = (Math.sin(t / 11) + 1) / 2; // 0..1
    try {
      filter.frequency.setTargetAtTime(480 + wobble * 520, t, 1.8);
    } catch {
      /* ignore */
    }
  }, 400);

  ambient.running = true;
}

/** Start/stop the ambient pad. Respects `muted` (a muted pad stays silent). */
export function setAmbient(enabled: boolean) {
  ambient.wanted = enabled;
  if (enabled) {
    if (!muted) startAmbient();
  } else {
    teardownAmbient(1200);
  }
}
