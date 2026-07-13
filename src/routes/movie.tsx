import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Search, Film, ArrowRight, Loader2, Share2, Moon, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { MovieCard } from "@/components/MovieCard";
import { useDateStore } from "@/lib/store";
import { useUrlSync, getMovieIdFromUrl, createShareableUrl } from "@/hooks/useUrlSync";
import { searchMovies, getMovieById, type Movie, fetchOriginalRecommendations } from "@/lib/movies";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date, time, loveMessage, isDarkMode, setDarkMode } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { syncUrl, syncState } = useUrlSync();
  const randomMessage = useRandomMessage("playful");

  // Format date and time for sharing
  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const formattedTime = time
    ? new Date(`1970-01-01T${time}:00`).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Sync state from URL on mount
  useEffect(() => {
    syncState();

    // Initialize share URL
    const url = createShareableUrl();
    setShareUrl(url);
  }, [syncState]);

  // Check if we came from URL with movie ID and try to hydrate
  useEffect(() => {
    const movieIdFromUrl = getMovieIdFromUrl();
    if (movieIdFromUrl && !movie) {
      const fetchMovie = async () => {
        try {
          setError(null);
          const movieData = await getMovieById(movieIdFromUrl.toString());
          if (movieData) {
            setMovie(movieData);
            syncUrl();
          } else {
            setError("Movie not found");
            toast.error("Movie not found");
          }
        } catch (err) {
          console.error("Failed to fetch movie from URL:", err);
          setError("Failed to load movie");
          toast.error("Failed to load movie");
        }
      };
      fetchMovie();
    }
  }, [movie, setMovie, syncUrl]);

  // Guard: if someone deep-links here without a date, send them back.
  // Use useEffect to avoid render-time side effects
  useEffect(() => {
    if (!date) {
      navigate({ to: "/date" });
    }
  }, [date, navigate]);

  // Load original recommendations on initial mount
  useEffect(() => {
    if (initialLoad) {
      const loadInitialRecommendations = async () => {
        try {
          setLoading(true);
          const recommendations = await fetchOriginalRecommendations();
          setResults(recommendations);
          setLoading(false);
        } catch (err) {
          console.error("Failed to load initial recommendations:", err);
          setError("Failed to load recommendations");
          toast.error("Failed to load recommendations");
          setLoading(false);
        }
      };
      loadInitialRecommendations();
      setInitialLoad(false);
    }
  }, [initialLoad]);

  // Update shareable URL and sync URL whenever state changes
  useEffect(() => {
    const url = createShareableUrl();
    setShareUrl(url);
    syncUrl();
  }, [date, time, movie, loveMessage, isDarkMode, syncUrl]);

  // Debounced realtime search
  useEffect(() => {
    if (initialLoad) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const t = setTimeout(async () => {
      try {
        if (query.trim() === "") {
          const recommendations = await fetchOriginalRecommendations();
          if (!cancelled) {
            setResults(recommendations);
            setError(null);
          }
        } else {
          const res = await searchMovies(query);
          if (!cancelled) {
            setResults(res);
            setError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError("Failed to search movies");
          toast.error("Failed to search movies");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, initialLoad]);

  const choose = useCallback(
    async (m: Movie) => {
      setLoading(true);
      const fullMovie = await getMovieById(m.id);
      if (fullMovie) {
        setMovie(fullMovie);
        syncUrl();
        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          navigate({ to: "/summary" });
        }, 0);
      } else {
        setError("Failed to load movie details");
        toast.error("Failed to load movie details");
      }
      setLoading(false);
    },
    [setMovie, syncUrl, navigate],
  );

  const handleShareClick = useCallback(async () => {
    const url = shareUrl;
    if (!url) return;

    const messageParts = [
      "Check out our date plan! 📅",
      formattedDate && `📅 ${formattedDate}`,
      formattedTime && `⏰ ${formattedTime}`,
      movie && `🎬 ${movie.title}`,
      loveMessage && `💌 "${loveMessage}"`,
      `🔗 ${url}`,
    ]
      .filter(Boolean)
      .join(" ");
    const message = messageParts.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Our Date Plan",
          text: message,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareUrl("Link copied! 📋");
        setTimeout(() => setShareUrl(url), 2000);
      }
    } catch (err) {
      console.error("Share failed", err);
      try {
        await navigator.clipboard.writeText(url);
        setShareUrl("Link copied! 📋");
        setTimeout(() => setShareUrl(url), 2000);
      } catch (copyErr) {
        console.error("Clipboard fallback failed", copyErr);
        alert("Could not share or copy link");
      }
    }
  }, [shareUrl, formattedDate, formattedTime, movie, loveMessage]);

  return (
    <PageShell className="max-w-3xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
        <Film className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-gradient">Pick our movie</h1>
      <p className="mt-2 text-muted-foreground">{randomMessage}</p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="relative mt-6 w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          placeholder="Search movies, genres, years..."
          aria-label="Search movies"
          className="w-full rounded-full border border-input bg-card py-4 pl-12 pr-12 text-base font-semibold text-foreground shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      <p className="mt-6 w-full text-left text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {query.trim() ? "Results" : "Our recommendations"}
      </p>

      {results.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          {query.trim()
            ? `No movies found for "${query}" — try another title 💭`
            : "No recommendations available — try again later 💭"}
        </p>
      ) : (
        <div className="mt-3 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {results.map((m, idx) => {
            let category: "recommended" | "classic" | undefined;
            if (results.length > 0) {
              if (idx < 2) {
                category = "recommended";
              } else if (idx >= results.length - 2) {
                category = "classic";
              }
            }
            return (
              <MovieCard
                key={m.id}
                movie={m}
                selected={movie?.id === m.id}
                onChoose={choose}
                category={category}
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {movie && (
          <div className="flex items-center justify-between">
            <AnimatedButton
              variant="gold"
              size="md"
              onClick={() => {
                syncUrl();
                navigate({ to: "/summary" });
              }}
            >
              Continue with {movie.title} <ArrowRight className="h-5 w-5" />
            </AnimatedButton>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShareClick}
                className="p-2 rounded hover:bg-muted transition-colors"
                title="Share Our Date ❤️"
                aria-label="Share Our Date ❤️"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => useDateStore.getState().toggleDarkMode()}
                className="p-2 rounded hover:bg-muted transition-colors"
                title="Click for night mode 🌙"
              >
                <Moon className="h-4 w-4" />
              </button>

              <button
                onClick={() => console.log("Heart clicked!")}
                className="p-2 rounded hover:bg-muted transition-colors"
                title="Tap for love 💙"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
