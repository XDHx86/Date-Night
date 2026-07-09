import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Film, ArrowRight, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { MovieCard } from "@/components/MovieCard";
import { useDateStore } from "@/lib/store";
import { searchMovies, SUGGESTED_MOVIES, type Movie } from "@/lib/movies";

export const Route = createFileRoute("/movie")({
  component: MoviePickerPage,
});

function MoviePickerPage() {
  const navigate = useNavigate();
  const { movie, setMovie, date } = useDateStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>(SUGGESTED_MOVIES);
  const [loading, setLoading] = useState(false);

  if (!date && typeof window !== "undefined") {
    navigate({ to: "/date" });
  }

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

  const choose = (m: Movie) => {
    setMovie(m);
    setTimeout(() => navigate({ to: "/summary" }), 450);
  };

  return (
    <PageShell particles={10} className="max-w-3xl">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
        <Film className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-gradient">Pick our movie</h1>
      <p className="mt-2 text-muted-foreground">What are we watching together? 🍿</p>

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

      {movie && (
        <AnimatedButton
          variant="gold"
          size="md"
          className="mt-8"
          onClick={() => navigate({ to: "/summary" })}
        >
          Continue with {movie.title} <ArrowRight className="h-5 w-5" />
        </AnimatedButton>
      )}
    </PageShell>
  );
}
