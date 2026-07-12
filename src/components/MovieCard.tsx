import { motion } from "framer-motion";
import { Star, Clock, Calendar, Check, Film } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { AnimatedButton } from "./AnimatedButton";
import { cn } from "@/lib/utils";
import { useState } from "react";

function Poster({ movie }: { movie: Movie }) {
  const [imageError, setImageError] = useState(false);

  // Default gradient for when poster is not available
  const DEFAULT_POSTER_GRADIENT = "linear-gradient(160deg, oklch(0.5 0.1 200), oklch(0.4 0.1 50))";

  // If we have a poster_path from TMDB, use it to build the poster URL
  if (movie.poster_path) {
    return (
      <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-2xl">
        {!imageError && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={`${movie.title} poster`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {(imageError || !movie.poster_path) && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backgroundImage: DEFAULT_POSTER_GRADIENT }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/25 p-2 text-center backdrop-blur-sm">
          <p className="line-clamp-2 font-display text-sm font-semibold text-white">{movie.title}</p>
        </div>
      </div>
    );
  }

  // Fallback to gradient background
  return (
    <div
      className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{ backgroundImage: DEFAULT_POSTER_GRADIENT }}
    >
      <div className="absolute inset-x-0 bottom-0 bg-black/25 p-2 text-center backdrop-blur-sm">
        <p className="line-clamp-2 font-display text-sm font-semibold text-white">{movie.title}</p>
      </div>
    </div>
  );
}

export function MovieCard({
  movie,
  selected,
  onChoose,
  compact = false,
  category,
}: {
  movie: Movie;
  selected?: boolean;
  onChoose: (movie: Movie) => void;
  compact?: boolean;
  category?: "recommended" | "classic";
}) {
  // Category-specific styles: border, ring, and overlay badge
  const categoryStyles =
    category === "recommended"
      ? "border-amber-400 ring-2 ring-amber-400 bg-amber-50/30 dark:bg-amber-950/20"
      : category === "classic"
        ? "border-slate-400 ring-1 ring-slate-400 bg-slate-50/30 dark:bg-slate-900/20"
        : "";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border bg-card p-3 text-left shadow-[var(--shadow-card)] transition-colors",
        selected ? "border-primary ring-2 ring-primary" : categoryStyles
      )}
    >
      {/* Category badge overlay */}
      {category && (
        <div
          className={cn(
            "absolute z-10 left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow",
            category === "recommended"
              ? "bg-amber-400 text-amber-950"
              : "bg-slate-400 text-slate-950"
          )}
        >
          {category === "recommended" ? (
            <>
              <Star className="h-3 w-3" /> Recommended
            </>
          ) : (
            <>
              <Film className="h-3 w-3" /> Classic
            </>
          )}
       </div>
      )}

      <Poster movie={movie} />

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold leading-tight text-card-foreground">
              {movie.title}
            </h3>
          </div>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-foreground">
            <Star className="h-3 w-3" /> {movie.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {!compact && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{movie.description}</p>
        )}

        <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {movie.year}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {movie.duration}m
          </span>
        </div>

        <AnimatedButton
          type="button"
          size="sm"
          variant={selected ? "gold" : "yes"}
          className="mt-2 w-full"
          onClick={() => onChoose(movie)}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" /> Chosen
            </>
          ) : (
            "Choose"
          )}
        </AnimatedButton>
      </div>
    </motion.article>
  );
}