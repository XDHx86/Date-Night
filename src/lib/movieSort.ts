/**
 * Client-side sorting for TMDB *search* results.
 *
 * Sorting operates entirely over the lightweight `/search/movie` payload we
 * already fetched — we never issue a per-card detail request just to sort.
 * That means a field the search endpoint omits (notably runtime) is unknown for
 * every result, and the comparator degrades gracefully: such entries sink to
 * the end regardless of sort direction, so incomplete data never produces a
 * broken or "N/A" ordering.
 *
 * Curated recommendations and the `"best-match"` key are never sorted here —
 * their order is editorial / TMDB-relevance, respectively, and the caller
 * bypasses this helper for those.
 */
import type { Movie } from "./movies";

/** Sort keys exposed by the search-result dropdown. */
export type SortKey =
  | "best-match"
  | "release-desc"
  | "release-asc"
  | "rating-desc"
  | "rating-asc"
  | "popularity-desc"
  | "popularity-asc"
  | "runtime-desc"
  | "runtime-asc";

/** `sessionStorage` key under which the chosen sort persists for the tab. */
export const SORT_STORAGE_KEY = "datenight.movieSort";

/** Option list fed straight into the route's `<Select>` dropdown. */
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "best-match", label: "Best match" },
  { value: "release-desc", label: "Release date — Newest first" },
  { value: "release-asc", label: "Release date — Oldest first" },
  { value: "rating-desc", label: "Rating — High to low" },
  { value: "rating-asc", label: "Rating — Low to high" },
  { value: "popularity-desc", label: "Popularity — Most popular" },
  { value: "popularity-asc", label: "Popularity — Least popular" },
  { value: "runtime-desc", label: "Runtime — Longest first" },
  { value: "runtime-asc", label: "Runtime — Shortest first" },
];

/** Whether a stored string is a recognized `SortKey`. */
export function isValidSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && SORT_OPTIONS.some((o) => o.value === value);
}

/**
 * The numeric comparison value for a movie under the given key, or `null` when
 * the field is unknown so the entry can be grouped at the end.
 */
function sortValueFor(movie: Movie, key: SortKey): number | null {
  switch (key) {
    case "release-desc":
    case "release-asc": {
      if (movie.releaseDate) {
        const t = Date.parse(movie.releaseDate);
        if (!Number.isNaN(t)) return t;
      }
      // no full date → approximate by year; year 0 means "no date at all"
      return movie.year > 0 ? Date.parse(`${movie.year}-01-01`) : null;
    }
    case "rating-desc":
    case "rating-asc":
      // vote_average is always present (TMDB returns 0 rather than null)
      return movie.rating;
    case "popularity-desc":
    case "popularity-asc":
      return movie.popularity == null ? null : movie.popularity;
    case "runtime-desc":
    case "runtime-asc":
      // search results never carry runtime → 0 means unknown
      return movie.duration > 0 ? movie.duration : null;
    default:
      return null;
  }
}

/**
 * Pure, deterministic sort by direction with unknown values grouped last.
 *
 * Returns a new array; the input is not mutated. The engine's sort is stable,
 * so entries that tie on the chosen key retain TMDB's relevance order.
 * `"best-match"` (and anything the caller already bypassed) passes through.
 */
export function sortMovies(movies: Movie[], key: SortKey): Movie[] {
  if (!movies || movies.length <= 1) return movies.slice();
  if (key === "best-match") return movies.slice();

  const known: { m: Movie; v: number }[] = [];
  const unknown: Movie[] = [];
  for (const m of movies) {
    const v = sortValueFor(m, key);
    if (v === null) unknown.push(m);
    else known.push({ m, v });
  }
  const descending = key.endsWith("-desc");
  known.sort((a, b) => (descending ? b.v - a.v : a.v - b.v));
  return [...known.map((x) => x.m), ...unknown];
}
