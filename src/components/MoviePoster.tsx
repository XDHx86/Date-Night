import { posterUrl, FALLBACK_POSTER } from "@/lib/tmdbImages";
import type { Movie } from "@/lib/movies";

interface Props {
  movie: Movie | null;
  className?: string;
}

/**
 * Poster image used on `/summary` and `/success` — acts as the
 * centerpiece of the plan card. Highest-resolution TMDB artwork,
 * falling back to the bundled image only on error.
 *
 * No decorative shadow by default; callers control the elevation
 * via the surrounding layout if they want hero treatment.
 */
export function MoviePoster({ movie, className = "" }: Props) {
  const src = posterUrl(movie) ?? FALLBACK_POSTER;
  const alt = movie ? `${movie.title} poster` : "A couple watching a film under the stars";

  return (
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      className={`object-cover shadow-[var(--shadow-md)] rounded-md ${className}`}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (el.src !== FALLBACK_POSTER) el.src = FALLBACK_POSTER;
      }}
    />
  );
}
