import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
import { posterUrl, FALLBACK_POSTER } from "@/lib/tmdbImages";
import type { Movie } from "@/lib/movies";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie | null;
  className?: string;
  /**
   * Pointer-parallax MotionValues (rotate/scale) from the summary hero — pass
   * `usePointerParallax(...)` values and the poster tilts to follow the cursor.
   * Inert when omitted or under `prefers-reduced-motion`. Kept optional so every
   * call site stays back-compatible.
   */
  parallaxStyle?: MotionStyle;
}

/**
 * Poster image used on `/summary` and `/success` — the centerpiece of the plan
 * card. Highest-resolution TMDB artwork, falling back to the bundled image only
 * on error.
 *
 * Wears a constant rose-glow halo and a gentle `breathe` scale so it reads as
 * alive even at rest; an optional `parallaxStyle` lets the hero tilt toward the
 * cursor. Callers still drive size/shape via `className` applied to the image.
 */
export function MoviePoster({ movie, className = "", parallaxStyle }: Props) {
  const prefersReduced = useReducedMotion() ?? false;
  const src = posterUrl(movie) ?? FALLBACK_POSTER;
  const alt = movie ? `${movie.title} poster` : "A couple watching a film under the stars";

  return (
    <motion.div
      style={
        parallaxStyle && !prefersReduced
          ? { ...parallaxStyle, transformPerspective: 1000 }
          : undefined
      }
      className="inline-block"
    >
      <div className="relative inline-block w-fit overflow-hidden rounded-xl rose-glow animate-breathe">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          className={cn("object-cover", className)}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== FALLBACK_POSTER) el.src = FALLBACK_POSTER;
          }}
        />
      </div>
    </motion.div>
  );
}
