import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Film, ArrowRight, Loader2, Share2, Moon, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { MovieCard } from "@/components/MovieCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useDateStore } from "@/lib/store";
import { syncUrlWithState as useStorage, getMovieIdFromUrl, createShareableUrl } from "@/lib/storage";
import { searchMovies, getMovieById, type Movie, fetchOriginalRecommendations } from "@/lib/movies";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date, time, setStep, loveMessage, setLoveMessage, isDarkMode, setDarkMode } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]); // Will be populated with original recommendations or search results
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // To track if we've loaded the initial recommendations
  const [shareUrl, setShareUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const randomMessage = useRandomMessage("playful"); // Get a playful message

  // Format date and time for sharing
  const formattedDate = date ? new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  const formattedTime = time ? new Date(`1970-01-01T${time}:00`).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  // Check if we came from URL with movie ID and try to hydrate
  useEffect(() => {
    const movieIdFromUrl = getMovieIdFromUrl();
    if (movieIdFromUrl && !movie) {
      // Fetch the movie by ID
      const fetchMovie = async () => {
        try {
          setError(null);
          const movieData = await getMovieById(movieIdFromUrl.toString());
          if (movieData) {
            setMovie(movieData);
          } else {
            setError("Movie not found");
            toast.error("Movie not found");
          }
        } catch (err) {
          console.error('Failed to fetch movie from URL:', err);
          setError("Failed to load movie");
          toast.error("Failed to load movie");
          // Fallback to search
        }
      };
      fetchMovie();
    }
  }, [movie, setMovie]);

  if (!date && typeof window !== "undefined") {
    navigate({ to: "/date" });
  }

  // Update step based on current route (movie selection is step 6)
  useEffect(() => {
    setStep(6);
  }, [setStep]);

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
          console.error('Failed to load initial recommendations:', err);
          setError("Failed to load recommendations");
          toast.error("Failed to load recommendations");
          setLoading(false);
        }
      };
      loadInitialRecommendations();
      setInitialLoad(false);
    }
  }, [initialLoad]);

  // Debounced realtime search that shows search results when query is not empty, otherwise shows original recommendations
  useEffect(() => {
    if (initialLoad) return; // Skip during initial load

    let cancelled = false;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        if (query.trim() === "") {
          // If query is empty, show original recommendations
          const recommendations = await fetchOriginalRecommendations();
          if (!cancelled) {
            setResults(recommendations);
            setError(null);
          }
        } else {
          // Otherwise, show search results
          const res = await searchMovies(query);
          if (!cancelled) {
            setResults(res);
            setError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]); // Clear results on error
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

  // Update shareable URL and sync URL whenever state changes
  useEffect(() => {
    const url = createShareableUrl();
    setShareUrl(url);
    const updateUrl = useStorage();
    updateUrl();
  }, [date, time, movie, loveMessage, isDarkMode]);

  // Initialize URL state sync on component mount
  useEffect(() => {
    const updateUrl = useStorage();
    // Call it once to sync URL -> state
    updateUrl();
  }, []);

  const choose = async (m: Movie) => {
    // When a movie is selected, we need to get the full details to ensure we have runtime, etc.
    try {
      setLoading(true);
      const fullMovie = await getMovieById(m.id);
      if (fullMovie) {
        setMovie(fullMovie);
        setTimeout(() => navigate({ to: "/summary" }), 450);
      } else {
        setError("Failed to load movie details");
        toast.error("Failed to load movie details");
      }
    } catch (err) {
      console.error('Failed to get movie details:', err);
      setError("Failed to load movie details");
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const url = shareUrl;
    if (!url) return;

    // Build share message
    const messageParts = [
      "Check out our date plan! 📅",
      formattedDate && `📅 ${formattedDate}`,
      formattedTime && `⏰ ${formattedTime}`,
      movie && `🎬 ${movie.title}`,
      loveMessage && `💌 "${loveMessage}"`,
      `🔗 ${url}`
    ].filter(Boolean).join(' ');
    const message = messageParts.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Our Date Plan',
          text: message,
          url: url
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareUrl("Link copied! 📋");
        setTimeout(() => setShareUrl(url), 2000);
      }
    } catch (err) {
      console.error('Share failed', err);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShareUrl("Link copied! 📋");
        setTimeout(() => setShareUrl(url), 2000);
      } catch (copyErr) {
        console.error('Clipboard fallback failed', copyErr);
        alert('Could not share or copy link');
      }
    }
  };

  return (
    <PageShell particles={10} className="max-w-3xl">
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={6} totalSteps={6} />

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
          {query.trim() ? `No movies found for "${query}" — try another title 💭` : "No recommendations available — try again later 💭"}
        </p>
      ) : (
        <div className="mt-3 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {results.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              selected={movie?.id === m.id}
              onChoose={choose}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {movie && (
          <div className="flex items-center justify-between">
            <AnimatedButton
              variant="gold"
              size="md"
              onClick={() => navigate({ to: "/summary" })}
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

              {/* Moon Easter Egg - clicking toggles dark mode */}
              <button
                onClick={() => {
                  const { toggleDarkMode } = useDateStore.getState();
                  toggleDarkMode();
                }}
                className="p-2 rounded hover:bg-muted transition-colors"
                title="Click for night mode 🌙"
              >
                <Moon className="h-4 w-4" />
              </button>

              {/* Heart Easter Egg - for fun */}
              <button
                onClick={() => {
                  // Could trigger a small celebration or message
                  console.log("Heart clicked!");
                }}
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