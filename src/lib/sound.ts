/**
 * Tiny self-contained sound engine.
 *
 * Two concerns live here, both driven from the `isAudioEnabled` Zustand slice
 * (the single sound source of truth — callers keep them in sync via the
 * `useBackgroundAudio` hook):
 *
 *   1. SFX blips — `sounds.{click,pop,celebrate,whoosh,twinkle,sparkle}`,
 *      short synthesized tones via the Web Audio API (no files needed).
 *   2. Background playlist — a single, DOM-less `<audio>` element that shuffles
 *      through every track Vite discovers under `src/assets/audio/*`. Adding
 *      or removing a file needs no code change here: the glob below auto-updates.
 *      On enable it picks a track at random; when a track ends it picks
 *      another, avoiding an immediate repeat when more than one exists.
 *
 * Browsers gate playback behind a user gesture, so `unlockAudio()` (fired by
 * the hook on the first pointerdown / keydown) both resumes the SFX
 * AudioContext and re-attempts a previously autoplay-blocked playlist.
 *
 * `muted` gates the SFX; the playlist is gated by `setBackgroundPlaylist`.
 */

let ctx: AudioContext | null = null;
let muted = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Resume the AudioContext after a user gesture, and re-attempt a background
 * playlist that was autoplay-blocked on the first enable. */
export function unlockAudio() {
  void getCtx()?.resume();
  backgroundPlaylist.unlock();
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
    // Unmuting also resumes the AudioContext so the next SFX is ready.
    void getCtx()?.resume();
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
 * Background playlist — shuffled background music auto-discovered from
 * `src/assets/audio/`. One <audio> element, advanced on "ended".
 * ------------------------------------------------------------------------- */

// Every audio file under the folder, discovered at build time. `?url` resolves
// each to its final, base-aware (dev / prod / custom `base`) URL, so a single
// `src` works everywhere. An empty folder yields an empty array — the playlist
// simply stays silent and never errors.
const TRACK_URLS = Object.values(
  import.meta.glob("/src/assets/audio/*.{mp3,wav,ogg,m4a}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
) as string[];

/** Background music sits a touch under full volume — atmosphere, not a feature. */
const BACKGROUND_VOLUME = 0.45;

/**
 * Choose the index of the next track. `current` is the just-played index (or
 * `-1` for the first pick). With more than one track we avoid an immediate
 * repeat by nudging one slot when the random draw lands on `current`.
 */
export function pickBackgroundTrack(
  current: number,
  count: number,
  random: () => number = Math.random,
): number {
  if (count <= 0) return -1;
  if (count === 1) return 0;
  let next = Math.floor(random() * count);
  if (next === current) next = (next + 1) % count;
  return next;
}

export interface BackgroundPlaylist {
  /** Number of discovered tracks (0 when the folder is empty). */
  readonly trackCount: number;
  /** Start/resume or stop the playlist. */
  setEnabled(enabled: boolean): void;
  /** Re-attempt playback if the last `play()` was autoplay-blocked. */
  unlock(): void;
}

/**
 * Build a shuffled background playlist over the given tracks. A parametric
 * factory — rather than reading the glob directly inside the player — keeps the
 * empty / single / multi-track cases and the "no immediate repeat" rule cleanly
 * unit-testable. The app uses a single module-level instance bound to the
 * auto-discovered tracks (see `setBackgroundPlaylist`).
 */
export function createBackgroundPlaylist(tracks: string[]): BackgroundPlaylist {
  const state = { wanted: false, current: -1, blocked: false };
  let el: HTMLAudioElement | null = null;

  function ensureEl(): HTMLAudioElement | null {
    if (typeof window === "undefined" || typeof document === "undefined") return null;
    if (!el) {
      const audio = new Audio();
      audio.preload = "auto";
      // We advance ourselves so the `ended` event fires; per-track looping is
      // off (the single-track case re-picks index 0 on end instead).
      audio.loop = false;
      audio.volume = BACKGROUND_VOLUME;
      audio.addEventListener("ended", onEnded);
      el = audio;
    }
    return el;
  }

  // Track the promise so a rejected autoplay attempt is handled (not surfaced
  // as an unhandled rejection) and so we know to retry on the next gesture.
  function handlePlay(p: Promise<void> | undefined | void) {
    if (!p || typeof p.then !== "function") return;
    p.then(() => {
      state.blocked = false;
    }).catch(() => {
      state.blocked = true;
    });
  }

  function load(idx: number) {
    const audio = ensureEl();
    if (!audio) return;
    state.current = idx;
    audio.src = tracks[idx];
    handlePlay(audio.play());
  }

  function onEnded() {
    if (!state.wanted) return;
    const next = pickBackgroundTrack(state.current, tracks.length);
    if (next < 0) return;
    load(next);
  }

  return {
    trackCount: tracks.length,
    setEnabled(enabled: boolean) {
      state.wanted = enabled;
      if (!enabled) {
        el?.pause();
        return;
      }
      if (tracks.length === 0) return; // empty folder — nothing to play, no error
      if (state.current < 0) {
        load(pickBackgroundTrack(state.current, tracks.length));
      } else {
        // Re-enable while a track is loaded: resume from where it paused.
        const audio = ensureEl();
        if (audio) handlePlay(audio.play());
      }
    },
    unlock() {
      if (state.wanted && state.blocked && el) {
        handlePlay(el.play());
      }
    },
  };
}

/** The single app-wide playlist instance, bound to the discovered tracks. */
let backgroundPlaylist: BackgroundPlaylist = createBackgroundPlaylist(TRACK_URLS);

/** Start/resume or stop the app's background playlist. */
export function setBackgroundPlaylist(enabled: boolean) {
  backgroundPlaylist.setEnabled(enabled);
}

/** Recreate the background playlist from the discovered tracks. Used to reset
 * player state (e.g. between tests); the normal app lifecycle never needs it. */
export function resetBackgroundAudio() {
  backgroundPlaylist.setEnabled(false);
  backgroundPlaylist = createBackgroundPlaylist(TRACK_URLS);
}
