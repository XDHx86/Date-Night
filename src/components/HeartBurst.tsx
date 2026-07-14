import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface BurstShape {
  id: number;
  x: number;
  y: number;
  rotate: number;
  emoji: string;
  delay: number;
  distance: number;
}

const GLYPHS = ["♥", "✦", "✿", "❀", "❄", "✾"];

/**
 * Subtle, radiating burst — plays after a "yes" tap. Glyphs are
 * kept minimal so the moment reads as one composed gesture rather
 * than a confetti explosion.
 */
export function HeartBurst({
  active,
  pieces = 12,
  onDone,
}: {
  active: boolean;
  pieces?: number;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(active);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  const bursts = useMemo<BurstShape[]>(() => {
    return Array.from({ length: pieces }, (_, i) => {
      const angle = (i / pieces) * Math.PI * 2;
      const distance = 90 + Math.random() * 160;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: Math.random() * 360 - 180,
        emoji: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        delay: Math.random() * 0.1,
        distance,
      };
    });
  }, [pieces, show]);

  return (
    <div aria-hidden className="pointer-events-none relative h-12 w-full overflow-visible">
      <AnimatePresence>
        {show &&
          bursts.map((b) => (
            <motion.span
              key={b.id}
              className="absolute left-1/2 top-1/2 select-none text-lg text-primary/80 will-change-transform"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: b.x,
                y: b.y,
                scale: 1,
                opacity: 0,
                rotate: b.rotate,
                transition: { delay: b.delay },
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {b.emoji}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
