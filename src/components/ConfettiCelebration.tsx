import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CONFETTI_COLORS, HEART_COLORS, PETAL_COLORS, SPARKLE_COLORS, pick } from "@/lib/palette";

/* ----------------------------------------------------------------------------
 * ConfettiCelebration — a pool of reusable celebration bursts.
 *
 * Split from the old single-sweep confetti into variants that randomize
 * count / palette / angles every time, so the app never celebrates the same
 * way twice — the anti-predictability pillar.
 *
 * Variants:
 *   - avalanche     the show-stopper — a big colorful confetti avalanche.
 *   - heartRain     hearts drifting down from the top.
 *   - petalShower   spring petals cascading.
 *   - sparkleBurst  a tight burst of pastel sparkles from center.
 *   - fireworks     delayed bursts like firework shells from multiple points.
 *
 * When `variant` is omitted, a random variant is chosen each activation (and
 * the piece field is reseeded every time too). `active` opens/closes the
 * burst; `onDone` fires once it settles.
 * ------------------------------------------------------------------------- */

export type ConfettiVariant =
  "avalanche" | "heartRain" | "petalShower" | "sparkleBurst" | "fireworks";

const ALL_VARIANTS: ConfettiVariant[] = [
  "avalanche",
  "heartRain",
  "petalShower",
  "sparkleBurst",
  "fireworks",
];

type Shape = "rect" | "dot" | "text";

interface Piece {
  id: number;
  startLeft: number; // %
  startTop: number; // %
  size: number;
  color: string;
  glyph?: string;
  shape: Shape;
  rotate: number;
  delay: number;
  ax: number; // burst x offset (px)
  ay: number; // burst y offset (px)
  exitRotate: number;
}

const SPARKLE_GLYPHS = ["✦", "✧", "✶", "✷", "✺", "✳"];
const HEART_GLYPHS = ["♥", "💖", "❤", "💗", "❥", "💕"];
const PETAL_GLYPHS = ["🌸", "❀", "✿", "🌼"];

function burstPiece(from: "center" | "firework"): Omit<Piece, "id"> {
  const angle = Math.random() * Math.PI * 2;
  const speed = 16 + Math.random() * 24;
  const startLeft = from === "firework" ? 18 + Math.random() * 64 : 50;
  const startTop = from === "firework" ? 22 + Math.random() * 40 : 50;
  return {
    startLeft,
    startTop,
    size: 5 + Math.random() * 7,
    color: pick(CONFETTI_COLORS),
    shape: "rect",
    rotate: Math.random() * 360,
    delay: Math.random() * 0.18,
    ax: Math.cos(angle) * speed * 6,
    ay: Math.sin(angle) * speed * 6 - 70,
    exitRotate: Math.random() * 720,
  };
}

function rainPiece(glyphs: string[], colors: string[]): Omit<Piece, "id"> {
  return {
    startLeft: Math.random() * 100,
    startTop: -8,
    size: 12 + Math.random() * 16,
    color: pick(colors),
    glyph: pick(glyphs),
    shape: "text",
    rotate: Math.random() * 120 - 60,
    delay: Math.random() * 0.6,
    ax: (Math.random() - 0.5) * 120, // slight horizontal drift
    ay: 0, // unused for rain (animated to viewport bottom)
    exitRotate: Math.random() * 360,
  };
}

function buildPieces(variant: ConfettiVariant): Piece[] {
  let defs: Omit<Piece, "id">[];
  switch (variant) {
    case "avalanche":
      defs = Array.from({ length: 78 }, () => {
        const b = burstPiece("center");
        return { ...b, color: pick([...CONFETTI_COLORS, ...HEART_COLORS]) };
      });
      break;
    case "sparkleBurst":
      defs = Array.from({ length: 42 }, () => {
        const b = burstPiece("center");
        return {
          ...b,
          color: pick(SPARKLE_COLORS),
          glyph: pick(SPARKLE_GLYPHS),
          shape: "text",
          size: 10 + Math.random() * 12,
        };
      });
      break;
    case "fireworks":
      defs = Array.from({ length: 54 }, () => {
        const b = burstPiece("firework");
        return { ...b, color: pick(CONFETTI_COLORS), shape: "dot" };
      });
      break;
    case "heartRain":
      defs = Array.from({ length: 40 }, () => rainPiece(HEART_GLYPHS, HEART_COLORS));
      break;
    case "petalShower":
      defs = Array.from({ length: 38 }, () => rainPiece(PETAL_GLYPHS, PETAL_COLORS));
      break;
  }
  return defs.map((d, i) => ({ ...d, id: i }));
}

const DURATION = 2500;

export function ConfettiCelebration({
  active,
  variant,
  onDone,
}: {
  active: boolean;
  variant?: ConfettiVariant;
  onDone?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [chosen, setChosen] = useState<ConfettiVariant>(variant ?? "avalanche");
  // Bumped on every activation so useMemo recomputes a freshly randomized
  // piece field even when the chosen variant is unchanged.
  const [seed, setSeed] = useState(0);

  const pieces = useMemo(() => buildPieces(chosen), [chosen, seed]);

  useEffect(() => {
    if (!active) return;
    setChosen(variant ?? pick(ALL_VARIANTS));
    setSeed((n) => n + 1);
    setShow(true);
    const timer = window.setTimeout(() => {
      setShow(false);
      onDone?.();
    }, DURATION);
    return () => window.clearTimeout(timer);
  }, [active, variant, onDone]);

  const rain = chosen === "heartRain" || chosen === "petalShower";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-50 overflow-hidden ${!show ? "hidden" : ""}`}
    >
      {pieces.map((p) => {
        const shapeStyle: React.CSSProperties =
          p.shape === "text"
            ? { fontSize: p.size, color: p.color }
            : p.shape === "dot"
              ? {
                  width: p.size * 0.8,
                  height: p.size * 0.8,
                  background: p.color,
                  borderRadius: "9999px",
                }
              : { width: p.size, height: p.size * 0.45, background: p.color, borderRadius: "1px" };

        return (
          <motion.span
            key={`${chosen}-${seed}-${p.id}`}
            className="absolute will-change-transform"
            style={{
              left: `${p.startLeft}%`,
              top: `${p.startTop}%`,
              color: p.color,
              ...shapeStyle,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.5 }}
            animate={
              rain
                ? {
                    x: p.ax,
                    y: "112vh", // drift down past the viewport
                    rotate: p.exitRotate,
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 2.2, ease: "easeIn", delay: p.delay },
                  }
                : {
                    x: p.ax,
                    y: p.ay,
                    rotate: p.rotate,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring" as const,
                      stiffness: 180,
                      damping: 22,
                      delay: p.delay,
                    },
                  }
            }
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {p.glyph}
          </motion.span>
        );
      })}
    </div>
  );
}
