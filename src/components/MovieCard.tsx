import { motion } from "framer-motion";
import { Check, Star, Clock, Calendar } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { AnimatedButton } from "./AnimatedButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK_GRADIENT = "linear-gradient(160deg, oklch(0.55 0.05 40), oklch(0.35 0.05 250))";

function Poster({ movie }: { movie: Movie }) {
  const [imageError, setImageError] = useState(false);

  if (movie.poster_path && !imageError) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={`${movie.title} poster`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {!imageError && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            aria-hidden
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[2/3] w-full overflow-hidden rounded-md"
      style={{ backgroundImage: FALLBACK_GRADIENT }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}

interface MovieCardProps {
  movie: Movie;
  selected?: boolean;
  onChoose: (movie: Movie) => void;
  compact?: boolean;
}

/**
 * Movie card — poster-led, no decorative chrome. The title and meta
 * set the supporting rhythm; the CTA is a single deliberate button.
 *
 * Variants:
 * - `compact`: hides the description (used in pickers where multiple
 *   cards compete for vertical space).
 */
export function MovieCard({ movie, selected, onChoose, compact = false }: MovieCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border bg-card p-3 text-left shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
    >
      <Poster movie={movie} />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-display text-lg font-medium leading-tight text-card-foreground">
            {movie.title}
          </h3>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground tabular-nums">
            <Star className="h-3 w-3 fill-current" aria-hidden /> {movie.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {!compact && movie.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {movie.description}
          </p>
        )}

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
