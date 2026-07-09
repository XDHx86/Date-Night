import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface Burst {
  id: number;
  x: number;
  y: number;
  rotate: number;
  emoji: string;
  distance: number;
}

const CONFETTI = ["💖", "💕", "✨", "🎉", "💗", "⭐", "🌸", "💞", "🥳"];

/**
 * One-shot celebratory burst of hearts + confetti radiating from the center.
 * Render it conditionally (e.g. after a "Yes") and it cleans itself up.
 */
export function HeartBurst({
  active,
  pieces = 28,
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
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  const bursts = useMemo<Burst[]>(() => {
    return Array.from({ length: pieces }, (_, i) => {
      const angle = (i / pieces) * Math.PI * 2;
      const distance = 120 + Math.random() * 260;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: Math.random() * 720 - 360,
        emoji: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
        distance,
      };
    });
  }, [pieces, show]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {show &&
          bursts.map((b) => (
            <motion.span
              key={b.id}
              className="absolute left-1/2 top-1/2 select-none text-3xl will-change-transform"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ x: b.x, y: b.y, scale: 1, opacity: 0, rotate: b.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            >
              {b.emoji}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}
