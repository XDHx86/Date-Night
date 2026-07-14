import { useEffect } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";

/**
 * Pointer parallax — the doc root reacts to the cursor.
 *
 * Returns normalized `x` and `y` MotionValues in the range -1..+1 (centered),
 * kept in sync via `requestAnimationFrame` so a stream of pointer events never
 * thrashes through React. Only attached on hover-capable pointers — on touch
 * the values stay 0 and nothing moves, which is exactly the calm fallback.
 *
 * `prefersReduced` is exposed so consumers can freeze transforms under the
 * reduced-motion preference (framer-motion reads the same media query too).
 *
 * Mount once per subtree that wants parallax (background, posters). The values
 * are cheap MotionValues, safe to share.
 */
export function usePointerParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supportsHover =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;

    let pending = false;
    let nx = 0;
    let ny = 0;

    const flush = () => {
      pending = false;
      x.set(nx);
      y.set(ny);
    };

    const onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!pending) {
        pending = true;
        requestAnimationFrame(flush);
      }
    };

    const onLeave = () => {
      // Drift gently back to neutral when the pointer exits — keeps the world
      // from freezing at an askew angle.
      nx = 0;
      ny = 0;
      if (!pending) {
        pending = true;
        requestAnimationFrame(flush);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  return { x, y, prefersReduced };
}
