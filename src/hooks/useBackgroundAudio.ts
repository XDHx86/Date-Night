import { useEffect } from "react";
import { useDateStore } from "@/lib/store";
import { setBackgroundPlaylist, setMuted, unlockAudio } from "@/lib/sound";

/**
 * Background audio — a shuffled playlist of the tracks auto-discovered in
 * `src/assets/audio/*`, plus the SFX mute gate. Both follow the `isAudioEnabled`
 * slice of the Zustand store (the single sound source of truth). The playlist
 * itself is a DOM-less `<audio>` element managed centrally in `lib/sound`; this
 * hook just wires the store flag to it.
 *
 *   - The playlist + SFX gate follow `isAudioEnabled` automatically.
 *   - Browsers gate audio behind a user gesture, so a one‑shot listener resumes
 *     the AudioContext and unblocks a blocked playlist on the first pointerdown /
 *     keydown (no autoplay error).
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
    setBackgroundPlaylist(isAudioEnabled);
  }, [isAudioEnabled]);

  // Unlock playback on the first interaction (autoplay policy). After this
  // fires once the browser lets the background music actually sound.
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
