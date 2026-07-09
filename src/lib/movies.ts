/**
 * Movie catalog + search.
 *
 * Data is normalized into a single `Movie` interface so a live provider
 * (e.g. TMDb) can be swapped in later behind `searchMovies` without touching
 * any UI code. The MVP ships with a curated offline catalog so the experience
 * never breaks — no API keys, no network failures.
 */

export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number; // out of 10
  runtime: number; // minutes
  genres: string[];
  overview: string;
  /** Gradient used to render a poster when no image is available. */
  posterGradient: string;
  emoji: string;
}

export const MOVIES: Movie[] = [
  {
    id: "httyd",
    title: "How to Train Your Dragon",
    year: 2010,
    rating: 8.1,
    runtime: 98,
    genres: ["Animation", "Adventure", "Fantasy"],
    overview:
      "A young Viking befriends an injured dragon and discovers there's more to both their worlds than fighting.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.14 250), oklch(0.35 0.1 260))",
    emoji: "🐉",
  },
  {
    id: "lalaland",
    title: "La La Land",
    year: 2016,
    rating: 8.0,
    runtime: 128,
    genres: ["Romance", "Musical", "Drama"],
    overview:
      "A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles.",
    posterGradient: "linear-gradient(160deg, oklch(0.6 0.18 300), oklch(0.5 0.16 20))",
    emoji: "🎹",
  },
  {
    id: "spiderverse",
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    rating: 8.4,
    runtime: 117,
    genres: ["Animation", "Action", "Adventure"],
    overview:
      "Teen Miles Morales becomes Spider-Man and teams up with heroes from other dimensions to save the multiverse.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.22 20), oklch(0.45 0.18 300))",
    emoji: "🕸️",
  },
  {
    id: "amelie",
    title: "Amélie",
    year: 2001,
    rating: 8.3,
    runtime: 122,
    genres: ["Romance", "Comedy"],
    overview:
      "A shy Parisian waitress decides to secretly change the lives of those around her for the better.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.16 45), oklch(0.4 0.13 130))",
    emoji: "☕",
  },
  {
    id: "notebook",
    title: "The Notebook",
    year: 2004,
    rating: 7.8,
    runtime: 123,
    genres: ["Romance", "Drama"],
    overview:
      "A poor young man and a rich young woman fall in love one summer and fight to stay together against all odds.",
    posterGradient: "linear-gradient(160deg, oklch(0.6 0.12 60), oklch(0.45 0.12 25))",
    emoji: "📓",
  },
  {
    id: "up",
    title: "Up",
    year: 2009,
    rating: 8.3,
    runtime: 96,
    genres: ["Animation", "Adventure", "Comedy"],
    overview:
      "An elderly widower flies his house to South America and picks up an unlikely young companion along the way.",
    posterGradient: "linear-gradient(160deg, oklch(0.65 0.15 220), oklch(0.55 0.16 30))",
    emoji: "🎈",
  },
  {
    id: "prideprejudice",
    title: "Pride & Prejudice",
    year: 2005,
    rating: 7.8,
    runtime: 129,
    genres: ["Romance", "Drama"],
    overview:
      "Sparks fly when spirited Elizabeth Bennet meets the proud Mr. Darcy in Georgian-era England.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.1 140), oklch(0.4 0.09 90))",
    emoji: "💌",
  },
  {
    id: "grandbudapest",
    title: "The Grand Budapest Hotel",
    year: 2014,
    rating: 8.1,
    runtime: 99,
    genres: ["Comedy", "Adventure"],
    overview:
      "A legendary concierge and his protégé become entangled in the theft of a priceless painting.",
    posterGradient: "linear-gradient(160deg, oklch(0.68 0.14 20), oklch(0.6 0.1 320))",
    emoji: "🛎️",
  },
  {
    id: "coco",
    title: "Coco",
    year: 2017,
    rating: 8.4,
    runtime: 105,
    genres: ["Animation", "Family", "Fantasy"],
    overview:
      "A music-loving boy journeys into the Land of the Dead to unlock his family's history.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.2 340), oklch(0.45 0.16 60))",
    emoji: "🎸",
  },
  {
    id: "prettywoman",
    title: "Pretty Woman",
    year: 1990,
    rating: 7.1,
    runtime: 119,
    genres: ["Romance", "Comedy"],
    overview:
      "A wealthy businessman hires a charming woman as his companion and falls unexpectedly in love.",
    posterGradient: "linear-gradient(160deg, oklch(0.6 0.2 10), oklch(0.45 0.14 350))",
    emoji: "🛍️",
  },
  {
    id: "moonrise",
    title: "Moonrise Kingdom",
    year: 2012,
    rating: 7.8,
    runtime: 94,
    genres: ["Comedy", "Romance", "Drama"],
    overview:
      "Two young lovers flee their New England town, sparking a frantic search across the island.",
    posterGradient: "linear-gradient(160deg, oklch(0.6 0.13 100), oklch(0.5 0.12 60))",
    emoji: "🏕️",
  },
  {
    id: "everything",
    title: "Everything Everywhere All at Once",
    year: 2022,
    rating: 7.9,
    runtime: 139,
    genres: ["Action", "Adventure", "Comedy"],
    overview:
      "A weary laundromat owner must connect with parallel-universe versions of herself to save existence.",
    posterGradient: "linear-gradient(160deg, oklch(0.55 0.18 330), oklch(0.45 0.16 200))",
    emoji: "🥯",
  },
];

/** Movies surfaced first on the picker page. */
export const SUGGESTED_MOVIES: Movie[] = [MOVIES[0], MOVIES[1], MOVIES[2]];

/**
 * Search the catalog by title, genre or year.
 * Async + provider-agnostic so a real API can replace the body later.
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const q = query.trim().toLowerCase();
  if (!q) return SUGGESTED_MOVIES;
  return MOVIES.filter((m) => {
    return (
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      String(m.year).includes(q)
    );
  });
}
