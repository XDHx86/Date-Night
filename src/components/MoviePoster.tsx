import { motion } from "framer-motion";
import { posterUrl, FALLBACK_POSTER } from "@/lib/tmdbImages";
import type { Movie } from "@/lib/movies";

interface Props {
  movie: Movie | null;
  className?: string;
}

/**
 * Movie poster / “logo” displayed inside the content box.
 *
 * Uses the highest‑resolution poster TMDB offers (`/original`),
 * transitioning to the bundled fallback if the network image can’t load.
 */
export function MoviePoster({ movie, className = "" }: Props) {
  const src = posterUrl(movie) ?? FALLBACK_POSTER;
  const alt = movie
    ? `${movie.title} poster`
    : "A cute couple watching a movie under the stars";

  return (
    <motion.img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      className={`object-cover shadow-[var(--shadow-glow)] rounded-3xl ${className}`}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (el.src !== FALLBACK_POSTER) el.src = FALLBACK_POSTER;
      }}
    />
  );
}
