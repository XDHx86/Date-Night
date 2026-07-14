import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HEART_COLORS, CONFETTI_COLORS, pick } from "@/lib/palette";
import { sounds } from "@/lib/sound";

interface Piece {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  dx: number;
  glyph: string;
  color: string;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotate: number;
  size: number;
  color: string;
}

const GLYPHS = ["♥", "💖", "❤", "✦", "🌸", "💗", "✨", "❥", "🎉", "💫"];

interface Props {
  active: boolean;
  count?: number;
  duration?: number;
}

/**
 * Full-screen love-bomb — the shake-triggered easter-egg payoff.
 *
 * Improved: many mixed glyphs (hearts, sparkles, petals, a confetti piece)
 * each drawing a random color from the romance palette, a companion burst of
 * confetti rects, a brief rose glow sweep over the viewport, and a celebratory
 * chord on fire. Kept transform/opacity only, `aria-hidden`, and capped so the
 * moment reads as a delightful surprise rather than a starship alert.
 */
export function HeartExplosion({ active, count = 18, duration = 1500 }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!active) return;

    // One celebratory chord per bomb — the burst's signature sound.
    sounds.celebrate();

    const now = Date.now();
    const next: Piece[] = Array.from({ length: count }, (_, i) => ({
      id: now + i,
      x: 28 + Math.random() * 44,
      y: 58 + Math.random() * 32,
      scale: 0.9 + Math.random() * 0.7,
      rotate: Math.random() * 360,
      dx: (Math.random() - 0.5) * 200,
      glyph: pick(GLYPHS),
      color: pick(HEART_COLORS),
    }));
    setPieces(next);

    // Companion confetti — a handful of colored rects bursting from center.
    const conf: Confetti[] = Array.from({ length: 26 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      return {
        id: now + 10000 + i,
        x: 50,
        y: 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        rotate: Math.random() * 720 - 360,
        size: 5 + Math.random() * 6,
        color: pick(CONFETTI_COLORS),
      };
    });
    setConfetti(conf);

    setGlow(true);

    const timeout = window.setTimeout(() => {
      setPieces([]);
      setConfetti([]);
      setGlow(false);
    }, duration);
    return () => window.clearTimeout(timeout);
  }, [active, count, duration]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Brief rose glow sweep — bloom then fade. */}
      <AnimatePresence>
        {glow ? (
          <motion.div
            key="glow"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 60%, oklch(from var(--primary) l c h / 0.4), transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.05, 1.15] }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>

      {/* Confetti companion. */}
      <AnimatePresence>
        {confetti.map((c) => (
          <motion.span
            key={c.id}
            className="absolute rounded-[1px]"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size * 0.5,
              background: c.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: c.vx, y: c.vy, opacity: 0, rotate: c.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>

      {/* Rising hearts + sparkles. */}
      <AnimatePresence>
        {pieces.map((h) => (
          <motion.span
            key={h.id}
            className="absolute select-none text-3xl"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              color: h.color,
              filter: `drop-shadow(0 0 6px ${h.color})`,
              transform: `rotate(${h.rotate}deg)`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 0],
              scale: h.scale,
              y: -240 - Math.random() * 90,
              x: h.dx,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {h.glyph}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
