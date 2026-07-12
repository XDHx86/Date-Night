/**
 * Test fixtures for Movie-related data.
 * These are pre-defined Movie objects for use in tests.
 */

import type { Movie } from "../../src/lib/movies";

// ============================================================================
// Individual Movie Fixtures
// ============================================================================

/**
 * A basic movie fixture for general testing.
 */
export const mockMovie: Movie = {
  id: "123",
  title: "Test Movie",
  description: "This is a test movie description.",
  poster_path: "/test-poster.jpg",
  backdrop_path: "/test-backdrop.jpg",
  rating: 7.5,
  tags: ["Action", "Adventure"],
  year: 2024,
  duration: 120,
};

/**
 * A movie fixture without a poster (for testing fallbacks).
 */
export const mockMovieNoPoster: Movie = {
  id: "124",
  title: "Movie Without Poster",
  description: "This movie has no poster image.",
  poster_path: null,
  backdrop_path: null,
  rating: 6.0,
  tags: ["Drama"],
  year: 2023,
  duration: 95,
};

/**
 * A high-rated movie fixture.
 */
export const mockHighRatedMovie: Movie = {
  id: "125",
  title: "Amazing Movie",
  description: "The best movie ever made.",
  poster_path: "/amazing-poster.jpg",
  backdrop_path: "/amazing-backdrop.jpg",
  rating: 9.5,
  tags: ["Drama", "Romance", "Award-Winning"],
  year: 2025,
  duration: 180,
};

/**
 * A low-rated movie fixture.
 */
export const mockLowRatedMovie: Movie = {
  id: "126",
  title: "Not So Good Movie",
  description: "This movie wasn't great.",
  poster_path: "/bad-poster.jpg",
  backdrop_path: "/bad-backdrop.jpg",
  rating: 3.5,
  tags: ["Horror"],
  year: 2020,
  duration: 85,
};

/**
 * A movie with no tags.
 */
export const mockMovieNoTags: Movie = {
  id: "127",
  title: "Untagged Movie",
  description: "This movie has no tags.",
  poster_path: null,
  backdrop_path: null,
  rating: 5.0,
  tags: [],
  year: 2022,
  duration: 100,
};

/**
 * A movie with a very long description.
 */
export const mockMovieLongDescription: Movie = {
  id: "128",
  title: "Movie with Long Description",
  description:
    "This movie has an extremely long description that goes on and on and on. " +
    "It tells the story of a hero's journey through various trials and tribulations, " +
    "meeting interesting characters along the way and ultimately learning valuable " +
    "lessons about life, love, and the power of perseverance. " +
    "The description continues with even more details about the plot, " +
    "the characters' motivations, the themes explored, and the visual style. " +
    "This is all just to test how the component handles long text.",
  poster_path: "/long-poster.jpg",
  backdrop_path: "/long-backdrop.jpg",
  rating: 8.0,
  tags: ["Epic", "Adventure"],
  year: 2024,
  duration: 200,
};

// ============================================================================
// Movie Collections
// ============================================================================

/**
 * An array of movies for testing lists/grids.
 */
export const mockMovies: Movie[] = [
  mockMovie,
  mockHighRatedMovie,
  mockLowRatedMovie,
  mockMovieNoPoster,
  mockMovieNoTags,
  {
    id: "129",
    title: "Another Test Movie",
    description: "Yet another test movie.",
    poster_path: "/another-poster.jpg",
    backdrop_path: "/another-backdrop.jpg",
    rating: 7.0,
    tags: ["Comedy"],
    year: 2024,
    duration: 90,
  },
  {
    id: "130",
    title: "Test Movie 2",
    description: "Second test movie.",
    poster_path: "/test2-poster.jpg",
    backdrop_path: "/test2-backdrop.jpg",
    rating: 6.5,
    tags: ["Thriller", "Mystery"],
    year: 2023,
    duration: 110,
  },
  {
    id: "131",
    title: "Test Movie 3",
    description: "Third test movie.",
    poster_path: "/test3-poster.jpg",
    backdrop_path: "/test3-backdrop.jpg",
    rating: 8.0,
    tags: ["Sci-Fi"],
    year: 2024,
    duration: 140,
  },
];

/**
 * An empty array of movies for testing empty states.
 */
export const emptyMovies: Movie[] = [];

/**
 * A large collection of movies for testing pagination/performance.
 */
export function createManyMovies(count: number = 50): Movie[] {
  const movies: Movie[] = [];

  for (let i = 0; i < count; i++) {
    movies.push({
      id: `movie-${i + 1000}`,
      title: `Movie ${i + 1}`,
      description: `Description for movie ${i + 1}`,
      poster_path: i % 5 === 0 ? null : `/movie-${i + 1}.jpg`,
      backdrop_path: i % 5 === 0 ? null : `/movie-${i + 1}-backdrop.jpg`,
      rating: 5 + (i % 5),
      tags: [`Tag ${i % 3 + 1}`],
      year: 2020 + (i % 5),
      duration: 90 + (i % 60),
    });
  }

  return movies;
}

// ============================================================================
// Movie Search Fixtures
// ============================================================================

/**
 * Fixture for movie search query.
 */
export const mockSearchQuery = "Test Movie";

/**
 * Fixture for empty search query.
 */
export const mockEmptySearchQuery = "";

/**
 * Fixture for search query with no results.
 */
export const mockNoResultsSearchQuery = "Non-Existent Movie That Does Not Exist";

// ============================================================================
// Movie Factory
// ============================================================================

/**
 * Options for creating a custom movie fixture.
 */
export interface CreateMovieOptions {
  id?: string;
  title?: string;
  description?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  rating?: number;
  tags?: string[];
  year?: number;
  duration?: number;
}

/**
 * Factory function for creating custom movie fixtures.
 * This is useful for creating variations of movies for testing.
 */
export function createMovie(options: CreateMovieOptions = {}): Movie {
  return {
    id: options.id ?? `movie-${Date.now()}`,
    title: options.title ?? "Test Movie",
    description: options.description ?? "A test movie",
    poster_path: options.poster_path ?? `/test-${Date.now()}.jpg`,
    backdrop_path: options.backdrop_path ?? `/test-${Date.now()}-backdrop.jpg`,
    rating: options.rating ?? 7.0,
    tags: options.tags ?? [],
    year: options.year ?? 2024,
    duration: options.duration ?? 120,
  };
}

/**
 * Create multiple custom movies at once.
 */
export function createMovies(
  count: number,
  optionsFactory?: (index: number) => Partial<CreateMovieOptions>
): Movie[] {
  const movies: Movie[] = [];

  for (let i = 0; i < count; i++) {
    const options = optionsFactory ? optionsFactory(i) : {};
    movies.push(createMovie({ ...options, id: `movie-${i}` }));
  }

  return movies;
}
