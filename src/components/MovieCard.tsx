import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { Check, Star, Clock, Calendar, Sparkles, Crown } from "lucide-react";
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
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/5"
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
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/5"
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
 * Glass surface, a "Recommended" (Sparkles) / "Classic" (Crown) editorial
 * badge top-left, a bold rating seal bottom-right, poster hover-zoom, and a
 * per-card pointer-follow tilt (sprang, ±6°) that stays frozen on touch and
 * under reduced-motion. The selected card swaps the thin ring for a pulsing
 * rose-glow halo.
 *
 * The badge and rating live in opposite poster corners so they never crowd
 * each other on narrow cards; the Choose button is anchored to the card foot
 * with `mt-auto` so a row of cards shares a clean baseline.
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
              "absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold text-play shadow-[var(--shadow-md)] ring-1 ring-white/30",
              category === "recommended"
                ? "bg-[image:var(--gradient-romance)] text-primary-foreground ring-white/40"
                : "bg-[image:linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-accent-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full",
                category === "recommended"
                  ? "bg-white/25 text-primary-foreground"
                  : "bg-accent-foreground/15 text-accent-foreground",
              )}
              aria-hidden
            >
              {category === "recommended" ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <Crown className="h-3 w-3" />
              )}
            </span>
            {category === "recommended" ? "Recommended" : "Classic"}
          </span>
        ) : null}

        <span
          className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full glass-strong px-2.5 py-1 shadow-[var(--shadow-md)] ring-1 ring-white/30"
          aria-label={`Rated ${movie.rating.toFixed(1)} out of 10`}
        >
          <Star
            className="h-4 w-4 shrink-0 fill-accent-2 text-accent-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
            aria-hidden
          />
          <span className="text-base font-bold leading-none tabular-nums text-card-foreground">
            {movie.rating.toFixed(1)}
          </span>
          <span
            className="text-[10px] font-semibold leading-none text-muted-foreground"
            aria-hidden
          >
            /10
          </span>
          <span className="sr-only">out of 10</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-display text-balance break-words text-lg leading-tight text-card-foreground sm:text-xl">
          {movie.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {movie.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full glass px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {!compact && movie.description ? (
          <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            {movie.description}
          </p>
        ) : null}

        <div className="mt-1 flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden /> {movie.year}
          </span>
          {movie.duration > 0 ? (
            <>
              <span className="text-muted-foreground/40" aria-hidden>
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {movie.duration}m
              </span>
            </>
          ) : null}
        </div>

        <AnimatedButton
          type="button"
          size="sm"
          variant={selected ? "soft" : "yes"}
          className="mt-auto w-full"
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
