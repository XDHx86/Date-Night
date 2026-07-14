import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Piece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  size: number;
  hue: number;
  delay: number;
  exitY: number;
  exitRotate: number;
}

/**
 * Refined confetti — small, intentional, single sweep.
 *
 * Replaces the previous wide rainbow blast. The hue range is now
 * restricted to warm tones that work with the rose accent and the
 * paper background; particle count is dialed back; nothing
 * sparkles past its welcome.
 */
export function ConfettiCelebration({
  active,
  particleCount = 36,
  onDone,
}: {
  active: boolean;
  particleCount?: number;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<Piece[]>([]);

  useEffect(() => {
    const generated: Piece[] = Array.from({ length: particleCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 18 + Math.random() * 22;
      const x = Math.cos(angle) * speed * 6;
      const y = Math.sin(angle) * speed * 6 - 80;
      return {
        id: i,
        x,
        y,
        rotate: Math.random() * 360,
        size: 4 + Math.random() * 6,
        // Warm palette — keep everything within the accent hue.
        hue: 350 + Math.random() * 30,
        delay: Math.random() * 0.25,
        exitY: y + 120 + Math.random() * 100,
        exitRotate: Math.random() * 720,
      };
    });
    setParticles(generated);
  }, [particleCount]);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [active, onDone]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-50 overflow-hidden ${!show ? "hidden" : ""}`}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-[1px]"
          style={{
            width: p.size,
            height: p.size * 0.45,
            background: `oklch(0.78 0.16 ${p.hue})`,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 180,
              damping: 22,
              delay: p.delay,
            },
          }}
          exit={{
            y: p.exitY,
            rotate: p.exitRotate,
            opacity: 0,
            transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          }}
        />
      ))}
    </div>
  );
}
