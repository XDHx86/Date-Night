import { useEffect, useRef, useState } from "react";

/**
 * useRotatingMessage — cycles through a list of phrases on an interval.
 *
 * Used for loading / waiting moments so the experience never feels frozen or
 * scripted. Deterministic on the server/first paint (returns the first
 * phrase), then steps through the list after hydration to avoid mismatches —
 * the same hydration-safe contract as `useRandomMessage`.
 *
 * Pauses the advance while the tab is hidden (`visibilitychange`) to avoid
 * wasted timers, and resets the interval if the caller swaps the list.
 *
 * @param list   The phrases to cycle through.
 * @param ms     Milliseconds between steps (default ~1900ms — slow enough to
 *               read, fast enough to feel alive).
 */
export function useRotatingMessage(list: string[], ms = 1900): string {
  const [index, setIndex] = useState<number>(() => 0);
  const listRef = useRef(list);
  listRef.current = list;

  useEffect(() => {
    if (!list.length || list.length === 1) return;

    let timer: number | undefined;

    const step = () => {
      setIndex((i) => (i + 1) % listRef.current.length);
    };

    const start = () => {
      stop();
      timer = window.setInterval(step, ms);
    };

    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ms, list.length]);

  return list[index] ?? "";
}
