import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, Share2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { TextInput } from "@/components/ui/field";
import { useDateStore } from "@/lib/store";
import { useUrlSync, getMovieIdFromUrl, createShareableUrl } from "@/hooks/useUrlSync";
import { searchMovies, getMovieById, type Movie, fetchOriginalRecommendations } from "@/lib/movies";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { toast } from "sonner";

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

/**
 * Movie picker — the only screen that actively searches.
 *
 * - A search field at the top doubles as the result query
 *   (when empty, the curated list of recommendations shows instead).
 * - Cards below are equal‑weight by default. The selected card gets
 *   a thin primary ring instead of an attention-grabbing halo.
 * - The bottom row appears once a film has been chosen: a primary
 *   "Continue with X" CTA and a secondary "Share" button. The dark
 *   mode toggle is delegated to the persistent bottom control bar —
 *   this screen sticks to one job per action.
 */
function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { syncUrl, syncState } = useUrlSync();
  const randomMessage = useRandomMessage("playful");

  useEffect(() => {
    syncState();
  }, [syncState]);

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
            setError("That movie didn't load — try another.");
            toast.error("Movie not found");
          }
        } catch {
          setError("That movie didn't load — try another.");
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
        setError("We couldn't load suggestions.");
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
          setError("Search failed. Try again in a moment.");
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
        setError("Couldn't load that movie's details.");
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

  return (
    <PageShell width="wide">
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

      <div className="mt-10 flex w-full max-w-2xl flex-col gap-4">
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

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex items-baseline justify-between">
          <span className="text-eyebrow">
            {query.trim() ? "Search results" : "Recommended for tonight"}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {results.length} {results.length === 1 ? "film" : "films"}
          </span>
        </div>

        {results.length === 0 && !loading ? (
          <p className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
            {query.trim()
              ? `No films matched "${query.trim()}". Try a different title.`
              : "No recommendations are loaded right now."}
          </p>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                selected={movie?.id === m.id}
                onChoose={choose}
                compact
              />
            ))}
          </div>
        )}
      </div>

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
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </PageShell>
  );
}
