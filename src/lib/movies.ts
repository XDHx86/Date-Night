/**
 * Movie catalog + search with TMDB integration.
 *
 * Data is normalized into a single `Movie` interface so a live provider
 * (e.g. TMDB) can be used when API keys are available, falling back to
 * the curated offline catalog when needed.
 */

import { env } from "./env";

export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number; // out of 10
  runtime: number; // minutes
  genres: string[];
  overview: string;
  /** Poster URL from TMDB or gradient for fallback */
  posterUrl?: string;
  posterGradient: string;
  /** Backdrop URL for background effects */
  backdropUrl?: string;
  /** Whether this is a staff/recommended pick */
  isRecommendation?: boolean;
  emoji: string;
}

// TMDB API response types
interface ТmdbMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

interface ТmdbResponse {
  page: number;
  results: ТmdbMovie[];
  total_pages: number;
  total_results: number;
}

// Legacy movie interface for backward compatibility during transition
interface LegacyMovie {
  id: string;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  overview: string;
  posterGradient: string;
  emoji: string;
}

// Current curated catalog (fallback)
const LEGACY_MOVIES: LegacyMovie[] = [
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
  }
];

/**
 * Movies surfaced first on the picker page.
 */
export const SUGGESTED_MOVIES: Movie[] = [
  {
    ...LEGACY_MOVIES[0],
    id: LEGACY_MOVIES[0].id,
    isRecommendation: false
  },
  {
    ...LEGACY_MOVIES[1],
    id: LEGACY_MOVIES[1].id,
    isRecommendation: false
  },
  {
    ...LEGACY_MOVIES[2],
    id: LEGACY_MOVIES[2].id,
    isRecommendation: true // Mark first movie as recommendation by default
  }
];

/**
 * Converts a TMDB movie to our internal Movie format
 */
const mapTmdbToMovie = (tmdbMovie: ТmdbMovie): Movie => {
  const releaseDate = new Date(tmdbMovie.release_date);
  const year = releaseDate.getFullYear();

  // Convert vote_average (out of 10) to our rating scale (already out of 10)
  const rating = tmdbMovie.vote_average;

  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    year: year,
    rating: rating,
    runtime: tmdbMovie.runtime,
    genres: tmdbMovie.genres.map(g => g.name),
    overview: tmdbMovie.overview,
    posterUrl: tmdbMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : undefined,
    posterGradient: tmdbMovie.poster_path
      ? "" // Will use posterUrl instead
      : "linear-gradient(160deg, oklch(0.5 0.1 200), oklch(0.4 0.1 50))", // Default gradient
    backdropUrl: tmdbMovie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`
      : undefined,
    // Mark as recommendation if it's highly rated and popular
    isRecommendation: tmdbMovie.vote_average >= 8.0 && tmdbMovie.popularity > 50,
    emoji: "🎬" // Default emoji, could be enhanced based on genre
  };
};

/**
 * Fetches movies from TMDB API
 */
const fetchMoviesFromTmdb = async (query: string): Promise<Movie[]> => {
  if (!env.isTmdbConfigured) {
    throw new Error("TMDB not configured");
  }

  try {
    const endpoint = query
      ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
      : `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${env.tmdbReadAccessToken}`,
        "Content-Type": "application/json;charset=utf-8"
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: ТmdbResponse = await response.json();
    return data.results.map(mapTmdbToMovie);
  } catch (error) {
    console.error("Failed to fetch from TMDB:", error);
    throw error;
  }
};

/**
 * Converts legacy movie to new format
 */
const mapLegacyToMovie = (legacyMovie: LegacyMovie): Movie => ({
  ...legacyMovie,
  id: legacyMovie.id,
  posterUrl: undefined, // Will use gradient
  backdropUrl: undefined,
  isRecommendation: false
});

/**
 * Search for movies - tries TMDB first, falls back to local cache
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const q = query.trim().toLowerCase();

  // If query is empty, return suggested movies
  if (!q) {
    return SUGGESTED_MOVIES;
  }

  // Try TMDB first if configured
  if (env.isTmdbConfigured) {
    try {
      const tmdbResults = await fetchMoviesFromTmdb(q);
      if (tmdbResults.length > 0) {
        return tmdbResults;
      }
    } catch (error) {
      console.warn("TMDB search failed, falling back to local cache:", error);
      // Fall through to local search
    }
  }

  // Fallback to local search (backward compatibility)
  const legacyResults = LEGACY_MOVIES.filter((m) => {
    return (
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      String(m.year).includes(q)
    );
  });

  // Convert legacy movies to new format
  return legacyResults.map(mapLegacyToMovie);
}

/**
 * Get movie by ID - tries TMDB first, falls back to local cache
 */
export const getMovieById = async (id: string): Promise<Movie | null> => {
  const movieId = parseInt(id, 10);

  // Try TMDB first if configured
  if (env.isTmdbConfigured && !isNaN(movieId)) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${env.tmdbReadAccessToken}`,
            "Content-Type": "application/json;charset=utf-8"
          }
        }
      );

      if (response.ok) {
        const tmdbMovie: ТmdbMovie = await response.json();
        return mapTmdbToMovie(tmdbMovie);
      }
    } catch (error) {
      console.warn(`Failed to fetch movie ${id} from TMDB, falling back to local cache:`, error);
    }
  }

  // Fallback to local search
  const legacyMovie = LEGACY_MOVIES.find(m => m.id === id);
  return legacyMovie ? mapLegacyToMovie(legacyMovie) : null;
};

/**
 * Get suggested movies (with recommendation flags)
 */
export const getSuggestedMovies = (): Movie[] => {
  return [
    {
      ...LEGACY_MOVIES[0],
      id: LEGACY_MOVIES[0].id,
      posterUrl: undefined,
      backdropUrl: undefined,
      isRecommendation: false
    },
    {
      ...LEGACY_MOVIES[1],
      id: LEGACY_MOVIES[1].id,
      posterUrl: undefined,
      backdropUrl: undefined,
      isRecommendation: false
    },
    {
      ...LEGACY_MOVIES[2],
      id: LEGACY_MOVIES[2].id,
      posterUrl: undefined,
      backdropUrl: undefined,
      isRecommendation: true
    }
  ];
};