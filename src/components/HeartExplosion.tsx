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
  /** When true the burst animation plays. */
  active: boolean;
  /** Number of hearts to project (default 50). */
  count?: number;
  /** Total lifetime of the burst in ms (default 1500). */
  duration?: number;
}

/**
 * Full‑screen love‑explosion animation, driven by device‑shake.
 *
 * - Renders nothing while `active` is false – zero cost.
 * - Spawns `count` transparent hearts with randomized vectors when toggled on.
 * - Cleanup on unmount and on the next `active` flip — no stacking, no leak.
 * - Callers should debounce `active` to avoid spamming triggers (the root
 *   component uses a 3 s cooldown).
 */
export function HeartExplosion({ active, count = 50, duration = 1500 }: Props) {
  const [bursts, setBursts] = useState<Heart[]>([]);

  useEffect(() => {
    if (!active) return;

    const now = Date.now();
    const next: Heart[] = Array.from({ length: count }, (_, i) => ({
      id: now + i,
      x: Math.random() * 100, // horizontal start (% of viewport)
      y: 60 + Math.random() * 30, // bottom half start (% from top)
      scale: 0.6 + Math.random() * 0.9,
      rotate: Math.random() * 360,
      dx: (Math.random() - 0.5) * 220, // horizontal drift
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
            className="absolute select-none text-4xl drop-shadow-md"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: `rotate(${h.rotate}deg)`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 0],
              scale: h.scale,
              y: -260 - Math.random() * 120,
              x: h.dx,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            ❤️
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
