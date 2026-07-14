import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useSeason } from "@/hooks/useSeason";
import { HEART_COLORS } from "@/lib/palette";

/* ----------------------------------------------------------------------------
 * FloatingBackground — a full-screen layer of gently floating hearts,
 * sparkles, petals and stars. The year-round romance base is always present;
 * a seasonal tint is layered on top so the world quietly re-themes with the
 * calendar (see useSeason).
 *
 * Every particle is randomized (glyph, color, size, speed, drift, opacity) so
 * the decoration never reads identically twice — the anti-predictability
 * pillar. Transform/opacity only; capped count; frozen under reduced motion
 * and paused while the tab is hidden.
 * ------------------------------------------------------------------------- */

const BASE_GLYPHS = ["♥", "✨", "\u{1F497}", "\u{1F496}", "★", "\u{1F490}"];
const BASE_COLORS = HEART_COLORS;

interface Particle {
  id: number;
  glyph: string;
  color: string;
  left: number; // %
  size: number; // px
  duration: number; // s
  delay: number; // s
  opacity: number;
  scale: number;
  dx: number; // sway distance (sign-less)
  dxDir: number; // -1 | 1
}

/** Build a frozen, randomized particle field (no per-render randomness drift). */
function buildField(count: number, glyphs: string[], colors: string[], seasonalBias: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const useSeasonal = seasonalBias > 0 && Math.random() < seasonalBias;
    return {
      id: i,
      glyph: (useSeasonal ? glyphs : BASE_GLYPHS)[Math.floor(Math.random() * glyphs.length)],
      color: (useSeasonal ? colors : BASE_COLORS)[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      size: 14 + Math.random() * 22,
      duration: 12 + Math.random() * 14,
      delay: Math.random() * 18,
      opacity: 0.22 + Math.random() * 0.5,
      scale: 0.65 + Math.random() * 0.6,
      dx: (12 + Math.random() * 22).toFixed(1) as unknown as number,
      dxDir: Math.random() > 0.5 ? 1 : -1,
    };
  });
}

export function FloatingBackground({ count = 24 }: { count?: number }) {
  const season = useSeason();
  const reduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hidden, setHidden] = useState(false);

  // Seed the field once on mount (and again if the seasonal set changes, so
  // a theme swap in dev is visible — the calendar month won't shift at runtime).
  useEffect(() => {
    setParticles(buildField(count, season.glyphs, season.colors, 0.35));
  }, [count, season]);

  // Pause the animation when the tab is hidden to save cycles.
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reduced) {
    // Calm pose: a few static, soft glyphs tucked behind the content.
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {particles.slice(0, 9).map((p) => (
          <span
            key={p.id}
            className="absolute select-none"
            style={{
              left: `${p.left}%`,
              bottom: `${10 + (p.id % 5) * 16}%`,
              fontSize: `${p.size}px`,
              color: p.color,
              opacity: 0.32,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 select-none will-change-transform"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              color: p.color,
              "--o": p.opacity,
              "--s": p.scale,
              "--dx": `${(p.dx as unknown as number) * p.dxDir}px`,
              animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
              animationPlayState: hidden ? "paused" : "running",
            } as React.CSSProperties
          }
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
