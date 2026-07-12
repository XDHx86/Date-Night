import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  width: number;
  height: number;
  background: string;
  delay: number;
  /** Stable exit offsets – generated once on the client. */
  exitX: number;
  exitY: number;
  exitRotate: number;
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#fbbf24", // amber
];

/**
 * Confetti celebration with physics‑based animation.
 *
 * Usage: `<ConfettiCelebration active={burst} onDone={...} />`
 *
 * Hydration safety:
 * - The component renders an **empty** (hidden) container on the server
 *   and on the first client render.
 * - All random values are generated inside `useEffect`, which only runs
 *   after hydration. The visual / animation behaviour is unchanged.
 */
export function ConfettiCelebration({
  active,
  particleCount = 80,
  onDone,
}: {
  active: boolean;
  particleCount?: number;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(false);
  // `particles` is empty on the server; populated after mount.
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);

  // ── Generate random particles only after the component has mounted ───────
  useEffect(() => {
    const generated: ConfettiPiece[] = Array.from(
      { length: particleCount },
      (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 30;
        const x = Math.cos(angle) * speed * 10;
        const y = Math.sin(angle) * speed * 10;
        const rotate = Math.random() * 360;

        // Deterministic, pre‑computed exit values keep the animation stable
        // across re‑renders and avoid `Math.random()` being called on the
        // server. They look just as random to the eye.
        const exitX = x + (Math.random() * 100 - 50);
        const exitY = y + 100 + Math.random() * 100;
        const exitRotate = rotate + Math.random() * 360;

        return {
          id: i,
          x,
          y,
          rotate,
          width: 5 + Math.random() * 10,
          height: 2 + Math.random() * 3,
          background: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 0.5,
          exitX,
          exitY,
          exitRotate,
        };
      },
    );
    setParticles(generated);
  }, [particleCount]);

  // ── Active / hide lifecycle (unchanged) ──────────────────────────────────
  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [active, onDone]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 0,
      opacity: 0,
    },
    visible: {
      x: (i: number) => particles[i]?.x ?? 0,
      y: (i: number) => particles[i]?.y ?? 0,
      rotate: (i: number) => particles[i]?.rotate ?? 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: (i: number) => particles[i]?.delay ?? 0,
      },
    },
    exit: {
      x: (i: number) => particles[i]?.exitX ?? 0,
      y: (i: number) => particles[i]?.exitY ?? 0,
      rotate: (i: number) => particles[i]?.exitRotate ?? 0,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-50 overflow-hidden ${
        !show ? "hidden" : ""
      }`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={show ? "visible" : "hidden"}
        exit="hidden"
        className="pointer-events-none"
      >
        {particles.map((p, i) => (
          <motion.div
            key={p.id}
            {...itemVariants}
            style={{
              left: "50%",
              top: "50%",
              width: `${p.width}px`,
              height: `${p.height}px`,
              backgroundColor: p.background,
              position: "absolute",
              transformOrigin: "center",
              borderRadius: "2px",
            }}
          />
        ))}
     </motion.div>
   </div>
  );
}
