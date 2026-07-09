import { motion } from "framer-motion";
import { Star, Clock, Calendar, Check } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { AnimatedButton } from "./AnimatedButton";
import { cn } from "@/lib/utils";

function Poster({ movie }: { movie: Movie }) {
  return (
    <div
      className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{ backgroundImage: movie.posterGradient }}
    >
      <span className="text-6xl drop-shadow-lg" aria-hidden>
        {movie.emoji}
      </span>
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
}: {
  movie: Movie;
  selected?: boolean;
  onChoose: (movie: Movie) => void;
  compact?: boolean;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border bg-card p-3 text-left shadow-[var(--shadow-card)] transition-colors",
        selected ? "border-primary ring-2 ring-primary" : "border-border",
      )}
    >
      <Poster movie={movie} />

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-card-foreground">
            {movie.title}
          </h3>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-gold/25 px-2 py-0.5 text-xs font-bold text-gold-foreground">
            <Star className="h-3 w-3 fill-current" /> {movie.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"
            >
              {g}
            </span>
          ))}
        </div>

        {!compact && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{movie.overview}</p>
        )}

        <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {movie.year}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {movie.runtime}m
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
