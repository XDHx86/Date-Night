import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HEART_COLORS, SPARKLE_COLORS, PETAL_COLORS, pick } from "@/lib/palette";

/* ----------------------------------------------------------------------------
 * HeartBurst — a composed, radiating burst of hearts / sparkles that plays
 * after a happy tap. Each piece gets a randomized color from the romance
 * palette plus a randomized glyph, so the moment never reads identically.
 *
 * Variants:
 *   - soft     the default radiating burst (12 pieces) used for "yes" taps.
 *   - heartRain a heavier heart shower, used for the closing celebration.
 *   - peek      a tiny single-sparkle peek, used for hidden interactions.
 * ------------------------------------------------------------------------- */

export type HeartBurstVariant = "soft" | "heartRain" | "peek";

const HEART_GLYPHS = ["♥", "❤", "💖", "💗", "❥", "💕"];
const SPARKLE_GLYPHS = ["✦", "✧", "✶", "✷"];

interface BurstShape {
  id: number;
  x: number;
  y: number;
  rotate: number;
  emoji: string;
  color: string;
  delay: number;
  distance: number;
  fall: boolean;
  startTop: number; // %, used for rain
  drift: number;
}

function buildShapes(variant: HeartBurstVariant, pieces: number, show: boolean): BurstShape[] {
  if (!show) return [];
  const glyphs =
    variant === "heartRain"
      ? HEART_GLYPHS
      : variant === "peek"
        ? SPARKLE_GLYPHS
        : [...HEART_GLYPHS, ...SPARKLE_GLYPHS];
  const palette =
    variant === "heartRain"
      ? HEART_COLORS
      : variant === "peek"
        ? SPARKLE_COLORS
        : [...HEART_COLORS, ...SPARKLE_COLORS, ...PETAL_COLORS];
  const count = variant === "peek" ? 1 : pieces;
  const fall = variant === "heartRain";

  return Array.from({ length: count }, (_, i) => {
    if (fall) {
      // Hearts falling from the top, drifting down past the viewport.
      return {
        id: i,
        x: 0,
        y: 0,
        rotate: Math.random() * 360 - 180,
        emoji: pick(glyphs),
        color: pick(palette),
        delay: Math.random() * 0.5,
        distance: 0,
        fall: true,
        startTop: -10,
        drift: (Math.random() - 0.5) * 100,
      };
    }
    const angle = variant === "peek" ? Math.random() * Math.PI * 2 : (i / count) * Math.PI * 2;
    const distance = 70 + Math.random() * 150;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: Math.random() * 360 - 180,
      emoji: pick(glyphs),
      color: pick(palette),
      delay: Math.random() * 0.1,
      distance,
      fall: false,
      startTop: 0,
      drift: 0,
    };
  });
}

export function HeartBurst({
  active,
  pieces = 12,
  variant = "soft",
  onDone,
}: {
  active: boolean;
  pieces?: number;
  variant?: HeartBurstVariant;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(active);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = window.setTimeout(
        () => {
          setShow(false);
          onDone?.();
        },
        variant === "peek" ? 900 : 1600,
      );
      return () => window.clearTimeout(t);
    }
  }, [active, variant, onDone]);

  // reseed whenever show flips on so each activation randomizes anew
  const burstSeed = show ? 1 : 0;
  const bursts = useMemo<BurstShape[]>(
    () => buildShapes(variant, pieces, show),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variant, pieces, burstSeed],
  );

  // heartRain is full-screen; soft/peek are contained to the parent.
  const full = variant === "heartRain";

  return (
    <div
      aria-hidden
      className={
        full
          ? "pointer-events-none fixed inset-0 z-50 overflow-hidden"
          : "pointer-events-none relative h-12 w-full overflow-visible"
      }
    >
      <AnimatePresence>
        {show &&
          bursts.map((b) => (
            <motion.span
              key={b.id}
              className="absolute select-none will-change-transform"
              style={
                full
                  ? { left: `${(b.id / Math.max(pieces, 1)) * 100}%`, top: `${b.startTop}%` }
                  : { left: "50%", top: "50%" }
              }
              initial={
                full
                  ? { y: 0, x: b.drift, scale: 0.6, opacity: 0, rotate: b.rotate, color: b.color }
                  : { x: 0, y: 0, scale: 0, opacity: 1, rotate: 0, color: b.color }
              }
              animate={
                full
                  ? {
                      y: "115vh",
                      x: [b.drift, b.drift + (Math.random() - 0.5) * 60],
                      scale: 1,
                      opacity: [0, 1, 1, 0],
                      rotate: b.rotate,
                    }
                  : {
                      x: b.x,
                      y: b.y,
                      scale: 1,
                      opacity: 0,
                      rotate: b.rotate,
                      transition: { delay: b.delay },
                    }
              }
              exit={{ opacity: 0 }}
              transition={
                full
                  ? { duration: 1.8, ease: "easeIn", delay: b.delay }
                  : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <span style={{ color: b.color, fontSize: 18 }}>{b.emoji}</span>
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
