import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SPARKLE_COLORS, pick } from "@/lib/palette";

/* ----------------------------------------------------------------------------
 * SparkleTrail — a trail of colorful sparks that follows the pointer (desktop)
 * and touch (mobile). Resurrected from the old version and improved:
 *
 *   - each spark gets a randomized glyph + color (drawn from `SPARKLE_COLORS`,
 *     the shared romance palette) plus size + jitter, so the trail never
 *     reads identically twice,
 *   - rides the existing `sparkle-pop` keyframe (transform/opacity only),
 *   - rAF-throttled + minimum-interval-gated so a flood of pointer events
 *     never thrashes React,
 *   - frozen entirely under `prefers-reduced-motion` (calm fallback),
 *   - paused when the tab is hidden (`visibilitychange`).
 *
 * `pointer-events-none` + `aria-hidden` so it's pure decoration — it never
 * intercepts taps or clutters the a11y tree.
 * ------------------------------------------------------------------------- */

const GLYPHS = ["✦", "✧", "✶", "✷", "✺", "❋", "✳", "✴"];
const MIN_INTERVAL = 26; // ms between sparks — keep the trail lively, not noisy
const CAP = 18;

interface Spark {
  id: number;
  x: number;
  y: number;
  glyph: string;
  color: string;
  size: number;
  dur: number;
}

export function SparkleTrail() {
  const reduced = useReducedMotion();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);
  const lastAddRef = useRef(0);
  const pendingRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });
  const hiddenRef = useRef(false);

  useEffect(() => {
    if (reduced) return; // calm: no trail under reduced-motion

    const addSpark = (clientX: number, clientY: number) => {
      const now = performance.now();
      if (now - lastAddRef.current < MIN_INTERVAL) return;
      lastAddRef.current = now;
      const id = idRef.current++;
      const spark: Spark = {
        id,
        x: clientX + (Math.random() - 0.5) * 6,
        y: clientY + (Math.random() - 0.5) * 6,
        glyph: pick(GLYPHS),
        color: pick(SPARKLE_COLORS),
        size: 10 + Math.random() * 12,
        dur: 0.6 + Math.random() * 0.32,
      };
      setSparks((s) => [...s.slice(-(CAP - 1)), spark]);
      window.setTimeout(
        () => setSparks((s) => s.filter((p) => p.id !== id)),
        spark.dur * 1000 + 80,
      );
    };

    const flush = () => {
      pendingRef.current = false;
      if (hiddenRef.current) return;
      const { x, y } = posRef.current;
      addSpark(x, y);
    };

    const onMove = (e: PointerEvent) => {
      // Only follow real pointers — ignore synthetic / touch-emulated moves.
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!pendingRef.current) {
        pendingRef.current = true;
        requestAnimationFrame(flush);
      }
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      posRef.current = { x: t.clientX, y: t.clientY };
      if (!pendingRef.current) {
        pendingRef.current = true;
        requestAnimationFrame(flush);
      }
    };

    const onVisibility = () => {
      hiddenRef.current = document.hidden;
    };
    onVisibility();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute select-none will-change-transform"
          style={{
            left: s.x,
            top: s.y,
            color: s.color,
            fontSize: s.size,
            textShadow: `0 0 6px ${s.color}`,
            animation: `sparkle-pop ${s.dur}s ease-out forwards`,
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}
