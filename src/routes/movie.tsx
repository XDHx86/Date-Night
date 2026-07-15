import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Loader2, Share2, ArrowRight, RefreshCw, ArrowDownUp } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { TextInput } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDateStore } from "@/lib/store";
import { useUrlSync, getMovieIdFromUrl, createShareableUrl } from "@/hooks/useUrlSync";
import { searchMovies, getMovieById, type Movie, fetchOriginalRecommendations } from "@/lib/movies";
import {
  SORT_OPTIONS,
  SORT_STORAGE_KEY,
  isValidSortKey,
  sortMovies,
  type SortKey,
} from "@/lib/movieSort";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useRotatingMessage } from "@/hooks/useRotatingMessage";
import { messages } from "@/lib/messages";
import { pick } from "@/lib/palette";
import { sounds } from "@/lib/sound";
import { toast } from "sonner";

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

/**
 * Movie picker — the only screen that actively searches.
 *
 * - A search field at the top doubles as the result query
 *   (when empty, the curated list of recommendations shows instead).
 * - Cards below are equal-weight by default. Recommended picks lead with a
 *   badge; the tail earns "Classic"; the rest are unbadged. The chosen card
 *   carries a pulsing rose-glow halo instead of a thin ring.
 * - The bottom row appears once a film has been chosen: a primary
 *   personality-labelled "Continue…" CTA and a secondary "Share" button.
 */

/** Personality flavours for the chosen-movie "Continue" — always keep the
 *  word "Continue" so the e2e journey (button-name regex) still steps.
 */
const CONTINUE_LABELS = [
  "Continue to the good part",
  "Continue to our date",
  "Continue, this is the one",
  "Continue when you're ready",
  "Continue with our pick",
  "Continue onward, lovely",
];

function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chosen sort for search results. Persisted in sessionStorage so it survives a
  // reload within the tab and auto-reapplies on every new search; curated
  // recommendations are never reordered, so the key is ignored outside search
  // mode. Defaults to "best-match" (TMDB relevance order) until the user opts
  // into a concrete sort.
  const [sortKey, setSortKey] = useState<SortKey>("best-match");
  const isSearchMode = query.trim().length > 0;

  const { syncUrl, syncState } = useUrlSync();
  const randomMessage = useRandomMessage("playful");
  const loadingMessage = useRotatingMessage(messages.loading);
  const emptyMessage = useRandomMessage("empty");
  const continueLabel = useMemo(() => pick(CONTINUE_LABELS), []);

  // Re-fetch the curated grid — the empty / error states and the hidden
  // emoji tap all route back through here so one reload keeps it consistent.
  const reload = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const recs = await fetchOriginalRecommendations();
      setResults(recs);
    } catch {
      setError(pick(messages.error));
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    syncState();
  }, [syncState]);

  // Hydrate the chosen sort once from sessionStorage so a mid-session reload
  // remembers the user's preference. An unrecognized stored value is ignored
  // (falls back to "best-match") rather than feeding the dropdown garbage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(SORT_STORAGE_KEY);
    if (stored && isValidSortKey(stored)) setSortKey(stored);
  }, []);

  // Persist the chosen sort for the tab lifetime (sessionStorage), so it
  // survives a reload and reapplies on the next search.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SORT_STORAGE_KEY, sortKey);
  }, [sortKey]);

  // Hydrate the movie from `?movie=` on deep-links.
  useEffect(() => {
    const id = getMovieIdFromUrl();
    if (id && !movie) {
      (async () => {
        try {
          setError(null);
          const data = await getMovieById(id.toString());
          if (data) {
            setMovie(data);
            syncUrl();
          } else {
            setError(pick(messages.error));
            toast.error("Movie not found");
          }
        } catch {
          setError(pick(messages.error));
          toast.error("Failed to load movie");
        }
      })();
    }
  }, [movie, setMovie, syncUrl]);

  // Deep-link guard.
  useEffect(() => {
    if (!date) navigate({ to: "/date" });
  }, [date, navigate]);

  // Initial recommendations.
  useEffect(() => {
    if (!initialLoad) return;
    (async () => {
      try {
        setLoading(true);
        const recs = await fetchOriginalRecommendations();
        setResults(recs);
      } catch {
        setError(pick(messages.error));
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    })();
  }, [initialLoad]);

  // Push state to URL whenever it changes.
  useEffect(() => {
    syncUrl();
  }, [date, movie, syncUrl]);

  // Debounced search.
  useEffect(() => {
    if (initialLoad) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const t = setTimeout(async () => {
      try {
        const data =
          query.trim() === "" ? await fetchOriginalRecommendations() : await searchMovies(query);
        if (!cancelled) {
          setResults(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setError(pick(messages.error));
          toast.error("Search failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, initialLoad]);

  const choose = useCallback(
    async (m: Movie) => {
      setLoading(true);
      const full = await getMovieById(m.id);
      if (full) {
        setMovie(full);
        syncUrl();
        setTimeout(() => navigate({ to: "/summary" }), 0);
      } else {
        setError(pick(messages.error));
        toast.error("Failed to load movie details");
      }
      setLoading(false);
    },
    [setMovie, syncUrl, navigate],
  );

  const handleShare = useCallback(async () => {
    const url = createShareableUrl();
    if (!url) return;
    const { date, time, movie, loveMessage } = useDateStore.getState();
    const dateNice = date
      ? new Date(date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "";
    const timeNice = time
      ? new Date(`1970-01-01T${time}:00`).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    const parts = [
      "Our date plan:",
      dateNice && `📅 ${dateNice}`,
      timeNice && `⏰ ${timeNice}`,
      movie && `🎬 ${movie.title}`,
      loveMessage && `💌 "${loveMessage}"`,
      `🔗 ${url}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Our date plan", text: parts, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied.");
      } catch {
        toast.error("Could not share right now.");
      }
    }
  }, []);

  const awaitingResults = results.length === 0;

  // What we actually render: curated recommendations keep their editorial order;
  // search results are reordered only when the user has picked a concrete sort
  // (best-match leaves TMDB relevance untouched). Recomputed whenever the raw
  // results, the chosen sort, or the mode change — so a new search picks up the
  // persisted sort automatically.
  const displayResults = useMemo(
    () => (isSearchMode ? sortMovies(results, sortKey) : results),
    [results, sortKey, isSearchMode],
  );

  return (
    <PageShell width="wide" className="max-w-5xl">
      <Eyebrow>Step 4 — Movie</Eyebrow>

      <h1 className="text-display text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl">
        What should we watch?
      </h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        Search by title, or pick from a short list of curated couch-date films.
      </p>

      {randomMessage ? (
        <p className="mt-6 max-w-sm text-xs italic text-muted-foreground/80">{randomMessage}</p>
      ) : null}

      <div className="mt-10 w-full max-w-2xl">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <TextInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder="Search a title…"
            aria-label="Search movies by title"
            className="pl-11 pr-12"
          />
          {loading ? (
            <Loader2
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      {error && awaitingResults ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl glass px-6 py-12 text-center"
          role="alert"
        >
          <span className="text-4xl" aria-hidden>
            🎞️
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Try again
          </Button>
        </motion.div>
      ) : loading && awaitingResults ? (
        <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-5 rounded-2xl glass px-6 py-16 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
          <span
            key={loadingMessage}
            className="animate-fade-in text-play text-base text-foreground"
          >
            {loadingMessage}
          </span>
        </div>
      ) : awaitingResults ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl glass px-6 py-12 text-center"
        >
          {/* Hidden interaction: tapping the reel plays a sparkle and refetches. */}
          <motion.button
            type="button"
            onClick={() => {
              sounds.sparkle();
              reload();
            }}
            whileTap={{ scale: 0.88, rotate: -12 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="cursor-pointer select-none text-5xl"
            aria-label="Surprise me — reload films"
          >
            <span aria-hidden>🎬</span>
          </motion.button>
          <p className="max-w-sm text-sm text-muted-foreground">{emptyMessage}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Try again
          </Button>
        </motion.div>
      ) : (
        <div className="mt-6 w-full">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-eyebrow">
              {isSearchMode ? "Search results" : "Recommended for tonight"}
            </span>
            <div className="flex items-center gap-3">
              {/* Sort control — only in search mode. A segmented/dropdown choice
                  that persists for the session and reapplies on each new search. */}
              {isSearchMode ? (
                <Select
                  value={sortKey}
                  onValueChange={(v) => {
                    if (isValidSortKey(v)) setSortKey(v);
                  }}
                >
                  <SelectTrigger
                    aria-label="Sort search results"
                    className="h-7 w-[160px] gap-1 rounded-full border-primary/25 bg-primary/5 text-xs sm:w-[180px]"
                  >
                    <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <span className="text-xs text-muted-foreground tabular-nums">
                {displayResults.length} {displayResults.length === 1 ? "film" : "films"}
              </span>
            </div>
          </div>

          <div className="mt-4 grid w-full grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
            {displayResults.map((m, idx) => (
              <MovieCard
                key={m.id}
                movie={m}
                selected={movie?.id === m.id}
                onChoose={choose}
                category={
                  // Editorial badges are exclusive to the curated list — search
                  // results never carry them so users can tell the two apart.
                  isSearchMode
                    ? undefined
                    : idx < 2
                      ? "recommended"
                      : idx >= displayResults.length - 2
                        ? "classic"
                        : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {movie ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Chosen: <span className="font-medium text-foreground">{movie.title}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden /> Share
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                syncUrl();
                navigate({ to: "/summary" });
              }}
            >
              {continueLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </PageShell>
  );
}
