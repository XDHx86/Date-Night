import { useEffect } from "react";
import { useDateStore } from "@/lib/store";
import { setAmbient, setMuted, unlockAudio } from "@/lib/sound";

/**
 * Background audio — drives the synthesized ambient pad + SFX mute gate from
 * the `isAudioEnabled` slice of the Zustand store (the single sound source of
 * truth). No binary asset is loaded: the pad is generated live in `lib/sound`
 * via the Web Audio API.
 *
 *   - The pad + SFX gate follow `isAudioEnabled` automatically.
 *   - Browsers gate audio behind a user gesture, so a one‑shot listener resumes
 *     the AudioContext on the first pointerdown / keydown (no autoplay error).
 *
 * Designed to be called once at the application root. Returns the store flag so
 * callers can read it without re-subscribing.
 */
export function useBackgroundAudio() {
  const isAudioEnabled = useDateStore((s) => s.isAudioEnabled);

  // Keep the global sound engine in sync with the store flag — covers initial
  // load, persisted preference, and any programmatic store change.
  useEffect(() => {
    setMuted(!isAudioEnabled);
    setAmbient(isAudioEnabled);
  }, [isAudioEnabled]);

  // Unlock the AudioContext on the first interaction (autoplay policy). After
  // this fires once the browser lets the ambient pad actually sound.
  useEffect(() => {
    const onFirst = () => unlockAudio();
    window.addEventListener("pointerdown", onFirst, { once: true, passive: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, []);

  return { isAudioEnabled };
}
