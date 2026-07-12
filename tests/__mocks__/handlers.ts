/**
 * MSW (Mock Service Worker) request handlers for API mocking.
 * These handlers mock external API calls, particularly the TMDB API,
 * to enable deterministic testing without requiring network access
 * or API keys.
 */

import { http, HttpResponse, type PathParams } from "msw";
import { setupServer } from "msw/node";
import type { Movie, TmdbMovie, TmdbGenreResponse, TmdbSearchResponse } from "../../src/lib/movies";

// ============================================================================
// Test Data
// ============================================================================

/**
 * Sample genre data from TMDB.
 */
export const mockGenres: TmdbGenreResponse = {
  genres: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ],
};

/**
 * Sample TMDB movie from search results.
 */
export interface TmdbSearchMovie extends Omit<TmdbMovie, "genres" | "runtime"> {
  genre_ids: number[];
}

/**
 * Sample movie data from TMDB search.
 */
export const mockSearchMovies: TmdbSearchMovie[] = [
  {
    id: 1273221,
    title: "Scary Movie 6",
    release_date: "2026-01-15",
    vote_average: 7.5,
    runtime: null,
    genre_ids: [35, 27],
    overview: "A comedic take on modern horror cliches.",
    poster_path: "/scary-movie-6.jpg",
    backdrop_path: "/scary-movie-6-backdrop.jpg",
    popularity: 100.5,
  },
  {
    id: 614945,
    title: "Voicemails for Isabelle",
    release_date: "2026-02-14",
    vote_average: 8.2,
    runtime: null,
    genre_ids: [10749, 18],
    overview: "A heartfelt romantic drama about love in the digital age.",
    poster_path: "/voicemails-isabelle.jpg",
    backdrop_path: "/voicemails-isabelle-backdrop.jpg",
    popularity: 150.2,
  },
  {
    id: 76696,
    title: "Sidewalls",
    release_date: "2025-12-01",
    vote_average: 6.8,
    runtime: null,
    genre_ids: [35, 10749],
    overview: "A romantic comedy about neighbors falling in love.",
    poster_path: "/sidewalls.jpg",
    backdrop_path: "/sidewalls-backdrop.jpg",
    popularity: 75.8,
  },
  {
    id: 1198994,
    title: "Send Help",
    release_date: "2025-11-15",
    vote_average: 7.0,
    runtime: null,
    genre_ids: [28, 53],
    overview: "A thrilling action movie about a rescue mission.",
    poster_path: "/send-help.jpg",
    backdrop_path: "/send-help-backdrop.jpg",
    popularity: 90.3,
  },
];

/**
 * Sample movie data from TMDB details endpoint (with genres inline).
 */
export const mockMovieDetails: Record<number, TmdbMovie> = {
  1273221: {
    id: 1273221,
    title: "Scary Movie 6",
    release_date: "2026-01-15",
    vote_average: 7.5,
    runtime: 112,
    genres: [
      { id: 35, name: "Comedy" },
      { id: 27, name: "Horror" },
    ],
    genre_ids: [],
    overview: "A comedic take on modern horror cliches. Two unlikely heroes must survive a night in a haunted mansion filled with hilarious scares.",
    poster_path: "/scary-movie-6.jpg",
    backdrop_path: "/scary-movie-6-backdrop.jpg",
    popularity: 100.5,
  },
  614945: {
    id: 614945,
    title: "Voicemails for Isabelle",
    release_date: "2026-02-14",
    vote_average: 8.2,
    runtime: 98,
    genres: [
      { id: 10749, name: "Romance" },
      { id: 18, name: "Drama" },
    ],
    genre_ids: [],
    overview: "A heartfelt romantic drama about love in the digital age. Two strangers connect through a series of voicemails left on an old phone.",
    poster_path: "/voicemails-isabelle.jpg",
    backdrop_path: "/voicemails-isabelle-backdrop.jpg",
    popularity: 150.2,
  },
  76696: {
    id: 76696,
    title: "Sidewalls",
    release_date: "2025-12-01",
    vote_average: 6.8,
    runtime: 105,
    genres: [
      { id: 35, name: "Comedy" },
      { id: 10749, name: "Romance" },
    ],
    genre_ids: [],
    overview: "A romantic comedy about neighbors falling in love. When a wall between their apartments comes down, so do their defenses.",
    poster_path: "/sidewalls.jpg",
    backdrop_path: "/sidewalls-backdrop.jpg",
    popularity: 75.8,
  },
  1198994: {
    id: 1198994,
    title: "Send Help",
    release_date: "2025-11-15",
    vote_average: 7.0,
    runtime: 120,
    genres: [
      { id: 28, name: "Action" },
      { id: 53, name: "Thriller" },
    ],
    genre_ids: [],
    overview: "A thrilling action movie about a rescue mission. A team of specialists must infiltrate a high-security facility to save a captured agent.",
    poster_path: "/send-help.jpg",
    backdrop_path: "/send-help-backdrop.jpg",
    popularity: 90.3,
  },
  // Classic date night movies
  199: {
    id: 199,
    title: "Amélie",
    release_date: "2001-04-25",
    vote_average: 8.3,
    runtime: 122,
    genres: [
      { id: 35, name: "Comedy" },
      { id: 10749, name: "Romance" },
    ],
    genre_ids: [],
    overview: "Amélie is an eccentric girl in Paris with a very active imagination. She decides to change the lives of those around her for the better.",
    poster_path: "/amelie.jpg",
    backdrop_path: "/amelie-backdrop.jpg",
    popularity: 200.5,
  },
  597: {
    id: 597,
    title: "Titanic",
    release_date: "1997-12-19",
    vote_average: 7.9,
    runtime: 195,
    genres: [
      { id: 18, name: "Drama" },
      { id: 10749, name: "Romance" },
    ],
    genre_ids: [],
    overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    poster_path: "/titanic.jpg",
    backdrop_path: "/titanic-backdrop.jpg",
    popularity: 300.0,
  },
};

/**
 * Map genre IDs to names using mock genre data.
 */
export function mapGenreIdsToNames(genreIds: number[]): string[] {
  return genreIds
    .map((id) => mockGenres.genres.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];
}

/**
 * Create a Movie object from TMDB movie data.
 */
export function createMovieFromTmdb(tmdbMovie: TmdbMovie | TmdbSearchMovie): Movie {
  const genreIds = "genre_ids" in tmdbMovie ? tmdbMovie.genre_ids : tmdbMovie.genres.map((g) => g.id);
  const allGenres = "genres" in tmdbMovie ? tmdbMovie.genres.map((g) => g.name) : mapGenreIdsToNames(genreIds);

  const releaseDate = new Date(tmdbMovie.release_date);
  const year = isNaN(releaseDate.getTime()) ? 0 : releaseDate.getFullYear();
  const duration = tmdbMovie.runtime ?? 0;

  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    rating: tmdbMovie.vote_average,
    tags: allGenres,
    year: year,
    duration: duration,
  };
}

// ============================================================================
// Error Response Handlers
// ============================================================================

/**
 * Create a TMDB API error response.
 */
function createTmdbError(status: number, message: string): HttpResponse {
  return HttpResponse.json(
    {
      success: false,
      status_code: status,
      status_message: message,
    },
    { status },
  );
}

// ============================================================================
// Request Handlers
// ============================================================================

/**
 * Handler for TMDB genre list endpoint.
 */
export const getGenresHandler = http.get(
  "https://api.themoviedb.org/3/genre/movie/list",
  ({ request }) => {
    // Check for API key or bearer token
    const hasApiKey = request.url.includes("api_key=");
    const hasBearerToken = request.headers.get("Authorization")?.startsWith("Bearer ");

    if (!hasApiKey && !hasBearerToken) {
      return createTmdbError(401, "Authentication required");
    }

    return HttpResponse.json(mockGenres);
  },
);

/**
 * Handler for TMDB movie search endpoint.
 */
export const searchMoviesHandler = http.get(
  "https://api.themoviedb.org/3/search/movie",
  ({ request }) => {
    // Check for API key or bearer token
    const hasApiKey = request.url.includes("api_key=");
    const hasBearerToken = request.headers.get("Authorization")?.startsWith("Bearer ");

    if (!hasApiKey && !hasBearerToken) {
      return createTmdbError(401, "Authentication required");
    }

    // Get search query
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    // Handle empty query
    if (!query || query.trim() === "") {
      return HttpResponse.json({
        page: 1,
        results: mockSearchMovies.slice(0, 20),
        total_pages: 1,
        total_results: mockSearchMovies.length,
      });
    }

    // Filter movies by query (case-insensitive)
    const filteredMovies = mockSearchMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.overview.toLowerCase().includes(query.toLowerCase())
    );

    // Handle no results
    if (filteredMovies.length === 0) {
      return HttpResponse.json({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    }

    return HttpResponse.json({
      page,
      results: filteredMovies.slice(0, 20),
      total_pages: 1,
      total_results: filteredMovies.length,
    });
  },
);

/**
 * Handler for TMDB movie details endpoint.
 */
export const getMovieDetailsHandler = http.get(
  "https://api.themoviedb.org/3/movie/:id",
  ({ params, request }) => {
    // Check for API key or bearer token
    const hasApiKey = request.url.includes("api_key=");
    const hasBearerToken = request.headers.get("Authorization")?.startsWith("Bearer ");

    if (!hasApiKey && !hasBearerToken) {
      return createTmdbError(401, "Authentication required");
    }

    const movieId = parseInt(params.id as string, 10);

    // Handle invalid ID
    if (isNaN(movieId)) {
      return createTmdbError(400, "Invalid movie ID");
    }

    // Handle movie not found
    if (!mockMovieDetails[movieId]) {
      return createTmdbError(404, "Movie not found");
    }

    return HttpResponse.json(mockMovieDetails[movieId]);
  },
);

/**
 * Handler for TMDB movie images endpoint.
 * Mocks image URL building without requiring actual image files.
 */
export const getMovieImagesHandler = http.get(
  "https://image.tmdb.org/t/p/:size/:path",
  ({ params }) => {
    // Return a small placeholder response for images
    // In tests, we typically verify image URLs are constructed correctly
    // rather than loading actual image data
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  },
);

/**
 * Custom handler for testing fallback behavior.
 * Can be used to simulate API failures.
 */
export const createFailingHandler = (method: string, url: string, status: number = 500) => {
  return http[method as keyof typeof http](url, () => {
    return createTmdbError(status, `Mock error for testing: ${status}`);
  });
};

/**
 * Custom handler for testing empty responses.
 */
export const createEmptyResponseHandler = (method: string, url: string) => {
  return http[method as keyof typeof http](url, () => {
    return HttpResponse.json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    });
  });
};

// ============================================================================
// Handler Collections
// ============================================================================

/**
 * All TMDB API handlers.
 */
export const tmdbHandlers = [
  getGenresHandler,
  searchMoviesHandler,
  getMovieDetailsHandler,
  getMovieImagesHandler,
];

/**
 * Default handlers for most tests.
 */
export const defaultHandlers = [...tmdbHandlers];

// ============================================================================
// MSW Server Setup
// ============================================================================

/**
 * Create and configure the MSW server for Node.js testing.
 * This server will intercept HTTP requests and return mock responses.
 */
export function createMswServer(handlers: typeof defaultHandlers = defaultHandlers) {
  return setupServer(...handlers);
}

/**
 * Create a server with failing handlers for error testing.
 */
export function createFailingMswServer() {
  const failingHandlers = [
    http.get("https://api.themoviedb.org/3/*", () => {
      return createTmdbError(500, "Internal Server Error");
    }),
    http.post("https://api.themoviedb.org/3/*", () => {
      return createTmdbError(500, "Internal Server Error");
    }),
  ];
  return setupServer(...failingHandlers);
}

// ============================================================================
// Request Parameter Types
// ============================================================================

export interface TmdbHandlersParams extends PathParams {
  id: string;
  size: string;
  path: string;
}
