/**
 * Helpers for building TMDB image URLs and providing graceful fallbacks.
 * The `original` size is the highest resolution TMDB offers.
 */

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/";

/** Build an image URL at a specific size (defaults to the largest, `original`). */
export const tmdbImage = (path: string | null | undefined, size: "original" | "w1280" | "w780" | "w500" | "w300" = "original"): string | null => {
  if (!path) return null;
  return `${TMDB_IMG_BASE}${size}${path}`;
};

/** Highest‑resolution backdrop image (falls back to poster if needed). */
export const backdropUrl = (movie: { backdrop_path?: string | null; poster_path?: string | null } | null): string | null =>
  movie ? tmdbImage(movie.backdrop_path || movie.poster_path) : null;

/** Highest‑resolution poster image (falls back to backdrop if needed). */
export const posterUrl = (movie: { poster_path?: string | null; backdrop_path?: string | null } | null): string | null =>
  movie ? tmdbImage(movie.poster_path || movie.backdrop_path) : null;

/**
 * Local fallback image bundled with the app.
 * We export a constant so callers don’t have to know the asset path.
 */
export const FALLBACK_POSTER = "/assets/final.jpg";
