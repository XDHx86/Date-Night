import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Star, Clock, Calendar, Sparkles } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { AnimatedButton } from "./AnimatedButton";
import { cn } from "@/lib/utils";

const FALLBACK_GRADIENT = "linear-gradient(160deg, oklch(0.55 0.05 40), oklch(0.35 0.05 250))";

/**
 * Whether the current pointer is hover-capable and fine (a real mouse).
 * Frozen false in SSR/jsdom (`matchMedia` absent) and on touch devices,
 * which is exactly the calm fallback we want for the tilt.
 */
function useHoverFinePointer(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    try {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch {
      return false;
    }
  }, []);
}

function Poster({ movie, zoom }: { movie: Movie; zoom: boolean }) {
  const [imageError, setImageError] = useState(false);

  if (movie.poster_path && !imageError) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={`${movie.title} poster`}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            zoom && "transition-transform duration-500 ease-out group-hover:scale-[1.06]",
          )}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[2/3] w-full overflow-hidden rounded-xl"
      style={{ backgroundImage: FALLBACK_GRADIENT }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}

interface MovieCardProps {
  movie: Movie;
  selected?: boolean;
  onChoose: (movie: Movie) => void;
  /** Hide the description (kept for the dense-picker use-case). */
  compact?: boolean;
  /** Optional editorial badge — first picks lead, the tail earns "Classic". */
  category?: "recommended" | "classic";
}

/**
 * Movie card — the rich, poster-led picker tile.
 *
 * Glass surface, a "Recommended" / "Classic" editorial badge, a corner rating
 * chip, poster hover-zoom, and a per-card pointer-follow tilt (sprang, ±6°)
 * that stays frozen on touch and under reduced-motion. The selected card
 * swaps the thin ring for a pulsing rose-glow halo.
 *
 * `compact` keeps the option to hide the description in a dense grid — the
 * route just doesn't pass it, so descriptions read by default.
 */
export function MovieCard({
  movie,
  selected = false,
  onChoose,
  compact = false,
  category,
}: MovieCardProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const canTilt = useHoverFinePointer() && !prefersReduced;

  // Pointer-follow tilt: pointer position within the card (-0.5..0.5) is
  // mapped to a ±6° rotation on each axis and eased through a spring so it
  // glides instead of snapping. Reset to neutral on leave.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 18 });

  const handleMove = canTilt
    ? (e: React.PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const w = r.width || 1;
        const h = r.height || 1;
        mx.set((e.clientX - r.left) / w - 0.5);
        my.set((e.clientY - r.top) / h - 0.5);
      }
    : undefined;
  const handleLeave = canTilt
    ? () => {
        mx.set(0);
        my.set(0);
      }
    : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={canTilt ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1000 } : undefined}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl glass p-4 text-left shadow-[var(--shadow-sm)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)]",
        selected && "animate-glow",
      )}
    >
      <div className="relative">
        <Poster movie={movie} zoom />

        {category ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-play shadow-[var(--shadow-sm)]",
              category === "recommended"
                ? "bg-[image:var(--gradient-romance)] text-primary-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            {category === "recommended" ? (
              <>
                <Sparkles className="h-3 w-3" aria-hidden /> Recommended
              </>
            ) : (
              "Classic"
            )}
          </span>
        ) : null}

        <span className="absolute right-2 top-2 z-10 inline-flex shrink-0 items-center gap-1 rounded-full glass-strong px-2 py-0.5 text-xs font-semibold tabular-nums text-card-foreground shadow-[var(--shadow-sm)]">
          <Star className="h-3 w-3 fill-current" aria-hidden /> {movie.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-display text-lg font-medium leading-tight text-card-foreground">
          {movie.title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {movie.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full glass px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {!compact && movie.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {movie.description}
          </p>
        ) : null}

        <div className="mt-1 flex items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden /> {movie.year}
          </span>
          {movie.duration > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {movie.duration}m
            </span>
          ) : null}
        </div>

        <AnimatedButton
          type="button"
          size="sm"
          variant={selected ? "soft" : "yes"}
          className="mt-2 w-full"
          onClick={() => onChoose(movie)}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Chosen
            </>
          ) : (
            "Choose"
          )}
        </AnimatedButton>
      </div>
    </motion.article>
  );
}
