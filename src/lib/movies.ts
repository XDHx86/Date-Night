/**
 * Movie catalog + search with TMDB integration.
 *
 * Data is normalized into a single Movie interface using TMDB as the sole source.
 * No mock or hardcoded data is used.
 */

import { env } from "./env";

export interface Movie {
  id: string;
  title: string;
  description: string; // from overview
  poster_path: string | null; // TMDB poster_path (for building URLs)
  backdrop_path: string | null; // TMDB backdrop_path (for possible future use)
  rating: number; // out of 10 (vote_average)
  tags: string[]; // Genre names
  year: number; // Year from release_date
  duration: number; // Runtime in minutes
}

/**
 * TMDB API response types
 */
interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number | null; // Can be null in API response
  genres: { id: number; name: string }[]; // Only in movie details, not in search
  genre_ids: number[]; // Only in search results
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
}

interface TmdbGenreResponse {
  genres: { id: number; name: string }[];
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * Builds the TMDB API URL with authentication (either bearer token or API key)
 */
function buildTmdbUrl(endpoint: string): string {
  const baseUrl = "https://api.themoviedb.org/3";
  const url = new URL(`${baseUrl}${endpoint}`);

  // Prefer Bearer token if available (more secure)
  if (env.tmdbReadAccessToken) {
    // We'll use Authorization header instead of query param
    return url.toString();
  }
  // Fallback to API key as query parameter
  if (env.tmdbApiKey) {
    url.searchParams.set('api_key', env.tmdbApiKey);
    return url.toString();
  }
  throw new Error("TMDB credentials not configured");
}

/**
 * Fetches and caches the genre list from TMDB
 */
let genreMapCache: Map<number, string> | null = null;

async function getGenreMap(): Promise<Map<number, string>> {
  if (genreMapCache) return genreMapCache;

  try {
    const url = buildTmdbUrl('/genre/movie/list?language=en-US');
    const response = await fetch(url, {
      headers: {
        ...(env.tmdbReadAccessToken ? { Authorization: `Bearer ${env.tmdbReadAccessToken}` } : {}),
        "Content-Type": "application/json;charset=utf-8"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch genres: ${response.status}`);
    }

    const data: TmdbGenreResponse = await response.json();
    const map = new Map<number, string>();
    for (const genre of data.genres) {
      map.set(genre.id, genre.name);
    }
    genreMapCache = map;
    return map;
  } catch (error) {
    console.error("Failed to fetch genre list:", error);
    // Return empty map to prevent breaking the app
    return new Map();
  }
}

/**
 * Maps TMDB genre IDs to genre names using the cached genre map
 */
async function mapGenreIdsToNames(genreIds: number[]): Promise<string[]> {
  const genreMap = await getGenreMap();
  return genreIds
    .map(id => genreMap.get(id))
    .filter((name): name is string => name !== undefined);
}

/**
 * Maps a TMDB movie object (from search or details) to our normalized Movie format
 * Note: tags are left as empty array and will be filled by the caller
 */
function mapTmdbToMovie(tmdbMovie: TmdbMovie): Movie {
  const releaseDate = new Date(tmdbMovie.release_date);
  const year = isNaN(releaseDate.getTime()) ? 0 : releaseDate.getFullYear();

  // Handle runtime: can be null in API response, default to 0
  const duration = tmdbMovie.runtime ?? 0;

  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    poster_path: tmdbMovie.poster_path,
    backdrop_path: tmdbMovie.backdrop_path,
    rating: tmdbMovie.vote_average,
    tags: [], // placeholder, will be replaced by caller
    year: year,
    duration: duration
  };
}

/**
 * Fetches movies from TMDB API (search endpoint)
 * @param query The search query
 * @returns Promise of Movie[] (limited to 6 results)
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const q = query.trim();

  // If query is empty, we return an empty array because we want to show the original recommendations, not popular movies
  if (!q) {
    return [];
  }

  try {
    const endpoint = `/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;
    const url = buildTmdbUrl(endpoint);
    const response = await fetch(url, {
      headers: {
        ...(env.tmdbReadAccessToken ? { Authorization: `Bearer ${env.tmdbReadAccessToken}` } : {}),
        "Content-Type": "application/json;charset=utf-8"
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TmdbSearchResponse = await response.json();

    // Process results: map genres and create Movie objects, then limit to 6
    const moviesWithGenres = await Promise.all(
      data.results
        .slice(0, 6) // Limit to 6 results
        .map(async (tmdbMovie) => {
          // Get genre names from genre_ids
          const tags = await mapGenreIdsToNames(tmdbMovie.genre_ids);

          // Create base movie object
          const movie = mapTmdbToMovie(tmdbMovie);

          // Override genres with the fetched tags
          return {
            ...movie,
            tags: tags
          };
        })
    );

    return moviesWithGenres;
  } catch (error) {
    console.error("Failed to search movies:", error);
    throw error;
  }
}

/**
 * Get movie by ID - fetches detailed movie information
 * @param id The movie ID
 * @returns Promise of Movie | null
 */
export const getMovieById = async (id: string): Promise<Movie | null> => {
  const movieId = parseInt(id, 10);
  if (isNaN(movieId)) {
    return null;
  }

  try {
    const endpoint = `/movie/${movieId}?language=en-US`;
    const url = buildTmdbUrl(endpoint);

    const response = await fetch(url, {
      headers: {
        ...(env.tmdbReadAccessToken ? { Authorization: `Bearer ${env.tmdbReadAccessToken}` } : {}),
        "Content-Type": "application/json;charset=utf-8"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Movie not found
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const tmdbMovie: TmdbMovie = await response.json();

    // Get genre names from the genres array (available in details)
    const tags = tmdbMovie.genres.map(g => g.name);

    // Map to our Movie format
    const movie = mapTmdbToMovie(tmdbMovie);

    return {
      ...movie,
      tags: tags
    };
  } catch (error) {
    console.warn(`Failed to fetch movie ${id} from TMDB:`, error);
    return null;
  }
};

/**
 * Fetches the original recommended movies (popular movies with details)
 * @returns Promise of Movie[] (6 movies with full details)
 */
export async function fetchOriginalRecommendations(): Promise<Movie[]> {
  try {
    // First, get the list of popular movies (we'll take the first 6)
    const popularUrl = buildTmdbUrl('/movie/popular?language=en-US&page=1');
    const popularResponse = await fetch(popularUrl, {
      headers: {
        ...(env.tmdbReadAccessToken ? { Authorization: `Bearer ${env.tmdbReadAccessToken}` } : {}),
        "Content-Type": "application/json;charset=utf-8"
      }
    });

    if (!popularResponse.ok) {
      throw new Error(`Failed to fetch popular movies: ${popularResponse.status}`);
    }

    const popularData: TmdbSearchResponse = await popularResponse.json();

    // Take the first 6 popular movies
    const top6 = popularData.results.slice(0, 6);

    // For each movie, fetch the detailed information to get runtime, genres, etc.
    const detailedMovies = await Promise.all(
      top6.map(async (tmdbMovie) => {
        const detailUrl = buildTmdbUrl(`/movie/${tmdbMovie.id}?language=en-US`);
        const detailResponse = await fetch(detailUrl, {
          headers: {
            ...(env.tmdbReadAccessToken ? { Authorization: `Bearer ${env.tmdbReadAccessToken}` } : {}),
            "Content-Type": "application/json;charset=utf-8"
          }
        });

        if (!detailResponse.ok) {
          // If we can't get the details, we return a movie with default values for missing fields
          // But we want to avoid showing incomplete data, so we'll log and return a basic movie object
          console.warn(`Failed to fetch details for movie ${tmdbMovie.id}: ${detailResponse.status}`);
          return mapTmdbToMovie(tmdbMovie); // This will have duration=0 and tags=[]
        }

        const tmdbMovieDetail: TmdbMovie = await detailResponse.json();
        const tags = tmdbMovieDetail.genres.map(g => g.name);
        const movie = mapTmdbToMovie(tmdbMovieDetail);
        return {
          ...movie,
          tags: tags
        };
      })
    );

    return detailedMovies;
  } catch (error) {
    console.error("Failed to fetch original recommendations:", error);
    throw error;
  }
}