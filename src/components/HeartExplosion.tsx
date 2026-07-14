import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Heart {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  dx: number;
}

interface Props {
  active: boolean;
  count?: number;
  duration?: number;
}

/**
 * Full-screen love-explosion animation, driven by device-shake.
 *
 * Now scaled down — the original 50 pieces competed with content.
 * Twelve well-chosen hearts read as intentional celebration rather
 * than a starship alert.
 */
export function HeartExplosion({ active, count = 12, duration = 1500 }: Props) {
  const [bursts, setBursts] = useState<Heart[]>([]);

  useEffect(() => {
    if (!active) return;

    const now = Date.now();
    const next: Heart[] = Array.from({ length: count }, (_, i) => ({
      id: now + i,
      x: 28 + Math.random() * 44,
      y: 60 + Math.random() * 30,
      scale: 0.9 + Math.random() * 0.6,
      rotate: Math.random() * 360,
      dx: (Math.random() - 0.5) * 180,
    }));

    setBursts(next);

    const timeout = window.setTimeout(() => setBursts([]), duration);
    return () => window.clearTimeout(timeout);
  }, [active, count, duration]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {bursts.map((h) => (
          <motion.span
            key={h.id}
            className="absolute select-none text-3xl"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: `rotate(${h.rotate}deg)`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 0],
              scale: h.scale,
              y: -220 - Math.random() * 80,
              x: h.dx,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            ♥
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
