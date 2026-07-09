import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Film, ArrowRight, Loader2, Share2, Moon, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { MovieCard } from "@/components/MovieCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useDateStore } from "@/lib/store";
import { useStorage } from "@/lib/storage";
import { searchMovies, SUGGESTED_MOVIES, type Movie, getMovieIdFromUrl, createShareableUrl } from "@/lib/movies";
import { useRandomMessage } from "@/hooks/useRandomMessage";

// Initialize URL state sync on component mount
useEffect(() => {
  const updateUrl = useStorage();
  // Call it once to sync URL -> state
  updateUrl();
  // We could also set up a listener, but for simplicity we'll call it on mount
  // In a production app, we'd want to synchronize both ways continuously
}, []);

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date, step, setStep } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>(SUGGESTED_MOVIES);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const randomMessage = useRandomMessage("playful"); // Get a playful message

  // Check if we came from URL with movie ID and try to hydrate
  useEffect(() => {
    const movieIdFromUrl = getMovieIdFromUrl();
    if (movieIdFromUrl && !movie) {
      // In a real implementation, we'd fetch the movie here
      // For now, we'll rely on the search to find it
      // This is a simplified approach
    }
  }, [movie]);

  if (!date && typeof window !== "undefined") {
    navigate({ to: "/date" });
  }

  // Update step based on current route (movie selection is step 6)
  useEffect(() => {
    setStep(6);
  }, [setStep]);

  // Debounced realtime search that gracefully falls back to suggestions.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchMovies(query);
        if (!cancelled) setResults(res);
      } catch {
        if (!cancelled) setResults(SUGGESTED_MOVIES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  // Update shareable URL whenever state changes
  useEffect(() => {
    const url = createShareableUrl();
    setShareUrl(url);
  }, [date, time, movie]);

  const choose = (m: Movie) => {
    setMovie(m);
    setTimeout(() => navigate({ to: "/summary" }), 450);
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show temporary feedback
      const originalText = shareUrl;
      setShareUrl("Link copied! 📋");
      setTimeout(() => setShareUrl(shareUrl), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
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

      <div className="relative mt-6 w-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, genres, years..."
          aria-label="Search movies"
          className="w-full rounded-full border border-input bg-card py-4 pl-12 pr-12 text-base font-semibold text-foreground shadow-[var(--shadow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      <p className="mt-6 w-full text-left text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {query.trim() ? "Results" : "Suggested for us"}
      </p>

      {results.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No movies found for "{query}" — try another title 💭
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
                title="Share your movie pick"
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

              {/* Heart Easter Ed - for fun */}
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