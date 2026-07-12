import { useEffect, useRef } from "react";
import { useDateStore } from "@/lib/store";

interface Options {
  /** Audio src (defaults to the bundled music file). */
  src?: string;
  /** Volume between 0 and 1. */
  volume?: number;
}

/**
 * Background audio manager.
 *
 * - Attempts to autoplay immediately when the document is ready.
 * - If blocked by the browser's autoplay policy, attaches one‑shot
 *   listeners that resume playback after the user's first interaction.
 * - Pauses / resumes based on the `isAudioEnabled` slice of the Zustand
 *   store, keeping the UI toggle and audio element in perfect sync.
 * - Cleans up listeners and tears down the element on unmount.
 *
 * Designed to be called once at the application root.
 */
export function useBackgroundAudio({
  src = "/assets/audio/love.mp3",
  volume = 0.45,
}: Options = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioEnabled = useDateStore((s) => s.isAudioEnabled);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (audioRef.current) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";
    audioRef.current = audio;

    const unlock = () => {
      audio
        .play()
        .then(() => {
          if (!isAudioEnabled) {
            // The first interaction unblocks playback; keep it going.
            // The UI state will be patched via the toggle if the user
            // explicitly disables later.
          }
        })
        .catch(() => {
          /* still blocked – try again on another interaction */
        });
    };

    const attemptAutoplay = () => {
      const result = audio.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          // Autoplay blocked — register a single interaction to unlock it.
          window.addEventListener("pointerdown", unlock, { once: true, passive: true });
          window.addEventListener("keydown", unlock, { once: true });
        });
      }
    };
    attemptAutoplay();

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // The dependency list intentionally excludes isAudioEnabled: this
    // effect should only run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, volume]);

  // Keep audio element in sync with the UI state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioEnabled) {
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Most likely still blocked (user hasn't interacted yet);
          // the unlock handler set up above will resume on next
          // pointerdown / keydown event.
        });
      }
    } else {
      audio.pause();
    }
  }, [isAudioEnabled]);

  return { isAudioEnabled };
}
