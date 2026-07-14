import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { usePointerParallax } from "@/hooks/usePointerParallax";

/* ----------------------------------------------------------------------------
 * AmbientBackdrop — a living, route-aware gradient mesh.
 *
 * Evolved in place from the old static backdrop into the app's breathing
 * atmosphere:
 *
 *   - a per-route gradient identity that cross-fades on navigation (no
 *     flicker — the new layer fades in over the old one before it unmounts),
 *   - a persistent layer of soft glowing blobs that drift on their own AND
 *     parallax toward the pointer at different depths,
 *   - an occasional rare shooting star on idle visits (the anti-predictability
 *     layer — kept low-probability so it stays a surprise).
 *
 * Everything is `transform`/`opacity` only, pointer-events-none and aria-hidden.
 * `prefers-reduced-motion` freezes the drift + parallax; the gradient stays.
 * ------------------------------------------------------------------------- */

type RouteVariant =
  | "love"
  | "begging"
  | "confirmation"
  | "date"
  | "time"
  | "movie"
  | "summary"
  | "success"
  | "letter";

const ROUTE_VARIANT: Record<string, RouteVariant> = {
  "/": "love",
  "/begging": "begging",
  "/confirmation": "confirmation",
  "/date": "date",
  "/time": "time",
  "/movie": "movie",
  "/summary": "summary",
  "/success": "success",
  "/love-letter": "letter",
};

const PALETTES: Record<RouteVariant, string> = {
  love: "linear-gradient(125deg, oklch(0.9 0.06 20), oklch(0.92 0.05 50), oklch(0.9 0.06 340), oklch(0.91 0.05 295))",
  begging:
    "linear-gradient(130deg, oklch(0.89 0.07 8), oklch(0.92 0.05 340), oklch(0.9 0.06 295), oklch(0.91 0.05 25))",
  confirmation:
    "linear-gradient(135deg, oklch(0.91 0.05 160), oklch(0.93 0.045 70), oklch(0.9 0.06 340), oklch(0.92 0.05 295))",
  date: "linear-gradient(125deg, oklch(0.92 0.07 45), oklch(0.9 0.06 25), oklch(0.92 0.05 60), oklch(0.91 0.06 340))",
  time: "linear-gradient(130deg, oklch(0.88 0.07 295), oklch(0.91 0.06 340), oklch(0.89 0.06 230), oklch(0.92 0.05 25))",
  movie:
    "linear-gradient(130deg, oklch(0.85 0.07 270), oklch(0.88 0.06 295), oklch(0.86 0.06 330), oklch(0.88 0.05 230))",
  summary:
    "linear-gradient(125deg, oklch(0.9 0.07 10), oklch(0.92 0.06 40), oklch(0.9 0.07 295), oklch(0.91 0.05 75))",
  success:
    "linear-gradient(120deg, oklch(0.9 0.08 8), oklch(0.93 0.07 50), oklch(0.91 0.08 295), oklch(0.92 0.06 160))",
  letter:
    "linear-gradient(130deg, oklch(0.9 0.06 295), oklch(0.92 0.05 340), oklch(0.9 0.06 230), oklch(0.91 0.05 25))",
};

interface BlobDef {
  color: string;
  size: number; // vmax units
  x: number; // % position
  y: number; // %
  depth: number; // parallax depth (px amplitude)
  drift: number; // autonomous drift period (s)
}

/** Persistent glowing blobs — a romance palette that reads on every route. */
const BLOBS: BlobDef[] = [
  { color: "oklch(0.72 0.19 10 / 0.5)", size: 38, x: 8, y: 12, depth: 26, drift: 19 },
  { color: "oklch(0.78 0.16 40 / 0.45)", size: 44, x: 78, y: 18, depth: 18, drift: 24 },
  { color: "oklch(0.72 0.15 295 / 0.42)", size: 50, x: 62, y: 74, depth: 34, drift: 26 },
  { color: "oklch(0.84 0.12 75 / 0.4)", size: 32, x: 18, y: 78, depth: 22, drift: 21 },
  { color: "oklch(0.7 0.14 230 / 0.32)", size: 46, x: 88, y: 52, depth: 30, drift: 27 },
];

function Blob({
  blob,
  px,
  py,
  reduced,
}: {
  blob: BlobDef;
  px: MotionValue<number>;
  py: MotionValue<number>;
  reduced: boolean | null;
}) {
  // Inner motion compresses the parallax through depth; outer carries it.
  const innerX = useTransform(px, (v) => (reduced ? 0 : v) * blob.depth);
  const innerY = useTransform(py, (v) => (reduced ? 0 : v) * blob.depth);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${blob.x}%`, top: `${blob.y}%`, x: innerX, y: innerY }}
      aria-hidden
    >
      <motion.div
        className="rounded-full blur-3xl"
        style={{
          width: `${blob.size}vmax`,
          height: `${blob.size}vmax`,
          background: `radial-gradient(circle at 40% 40%, ${blob.color}, transparent 70%)`,
        }}
        animate={
          reduced ? undefined : { x: [-6, 5, -4, 6], y: [-5, 6, -4, 5], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{
          duration: blob.drift,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.34, 0.68, 1],
        }}
        aria-hidden
      />
    </motion.div>
  );
}

/**
 * Rare shooting star — streaks once, low probability, only on hover-capable
 * non-reduced devices. Hidden so it stays a delightful surprise rather than
 * routine noise.
 */
function ShootingStar({ reduced }: { reduced: boolean | null }) {
  const [active, setActive] = useState(false);
  const [seed, setSeed] = useState(() => Math.random());

  useEffect(() => {
    if (reduced) return;
    const supportsHover =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;
    // ~7% of visits get a single star; if drawn, it fires after a calm beat.
    const roll = Math.random();
    if (roll > 0.075) return;
    const delay = 2500 + Math.random() * 6000;
    const t = window.setTimeout(() => {
      setSeed(Math.random());
      setActive(true);
      window.setTimeout(() => setActive(false), 1600);
    }, delay);
    return () => window.clearTimeout(t);
  }, [reduced]);

  if (!active) return null;

  const topPx = seed * 50; // somewhere across the top half
  const dur = 1.4;

  return (
    <motion.span
      key={seed}
      className="pointer-events-none absolute h-[2px] w-28 rounded-full"
      style={{
        top: `${topPx}%`,
        right: "-8%",
        background: "linear-gradient(90deg, transparent, oklch(0.95 0.06 70), transparent)",
        filter: "drop-shadow(0 0 6px oklch(0.9 0.08 70 / 0.7))",
      }}
      initial={{ x: "10vw", opacity: 0 }}
      animate={{ x: "-110vw", opacity: [0, 1, 1, 0] }}
      transition={{ duration: dur, ease: "easeIn", times: [0, 0.1, 0.85, 1] }}
    />
  );
}

export function AmbientBackdrop() {
  const location = useLocation();
  const variant = ROUTE_VARIANT[location.pathname] ?? "love";
  const mesh = PALETTES[variant];
  const reduced = useReducedMotion();
  const { x, y } = usePointerParallax();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Per-route mesh — cross-fades on navigation without flicker. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{
            background: mesh,
            backgroundSize: "320% 320%",
            animation: reduced ? undefined : "mesh-drift 22s ease infinite",
          }}
        />
      </AnimatePresence>

      {/* Soft vignette — keeps foreground legible over bright meshes. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, transparent 30%, oklch(from var(--background) l c h / 0.55) 100%)",
        }}
      />

      {/* Drifting, parallaxing glowing blobs (frozen under reduced motion). */}
      <div className="absolute inset-0">
        {BLOBS.map((b, i) => (
          <Blob key={i} blob={b} px={x} py={y} reduced={reduced} />
        ))}
      </div>

      <ShootingStar reduced={reduced} />

      {/* A delicate film grain — warmth + texture at low opacity. */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
