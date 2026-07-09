/**
 * Tiny self-contained sound engine using the Web Audio API.
 * No audio files needed — cute blips are synthesized on the fly.
 * Muted by default; the user toggles it on via the speaker button.
 */

let ctx: AudioContext | null = null;
let muted = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("sound-muted", value ? "1" : "0");
  }
  if (!value) void getCtx()?.resume();
}

export function initMutedFromStorage() {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem("sound-muted");
  muted = stored !== "0";
}

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

export const sounds = {
  click: () => tone(660, 0.12, "sine"),
  pop: () => tone(880, 0.15, "triangle"),
  celebrate: () => {
    tone(523, 0.15, "triangle", 0);
    tone(659, 0.15, "triangle", 0.12);
    tone(784, 0.2, "triangle", 0.24);
    tone(1046, 0.3, "triangle", 0.38);
  },
};
