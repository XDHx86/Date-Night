/**
 * Movie Factory for creating test Movie objects.
 * This factory provides a fluent API for building Movie objects
 * with customizable properties for testing.
 */

import type { Movie } from "../../src/lib/movies";
import { faker } from "@faker-js/faker";

// ============================================================================
// Movie Builder Class
// ============================================================================

/**
 * Builder class for creating Movie objects with a fluent API.
 * This allows for readable, chainable construction of test data.
 */
export class MovieBuilder {
  private data: Partial<Movie> = {};

  /**
   * Create a new MovieBuilder with default values.
   */
  constructor(private defaults: Partial<Movie> = {}) {}

  /**
   * Static factory method for creating a new builder.
   */
  static create(): MovieBuilder {
    return new MovieBuilder();
  }

  /**
   * Static factory method for creating a builder with random values.
   */
  static random(): MovieBuilder {
    return new MovieBuilder({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      rating: faker.number.float({ min: 1, max: 10, precision: 0.1 }),
      year: faker.number.int({ min: 2000, max: 2030 }),
      duration: faker.number.int({ min: 60, max: 200 }),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.lorem.word()),
    });
  }

  // ==========================================================================
  // Fluent Setters
  // ==========================================================================

  /**
   * Set the movie ID.
   */
  withId(id: string): this {
    this.data.id = id;
    return this;
  }

  /**
   * Set a random movie ID.
   */
  withRandomId(): this {
    this.data.id = faker.string.uuid();
    return this;
  }

  /**
   * Set the movie title.
   */
  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  /**
   * Set a random movie title.
   */
  withRandomTitle(): this {
    this.data.title = faker.lorem.words(3);
    return this;
  }

  /**
   * Set the movie description.
   */
  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * Set a random movie description.
   */
  withRandomDescription(length?: number): this {
    this.data.description = length ? faker.lorem.paragraph(length) : faker.lorem.paragraph();
    return this;
  }

  /**
   * Set the poster path.
   */
  withPosterPath(path: string | null): this {
    this.data.poster_path = path;
    return this;
  }

  /**
   * Set a random poster path.
   */
  withRandomPosterPath(): this {
    this.data.poster_path = `/${faker.string.uuid()}.jpg`;
    return this;
  }

  /**
   * Set no poster path (null).
   */
  withoutPoster(): this {
    this.data.poster_path = null;
    return this;
  }

  /**
   * Set the backdrop path.
   */
  withBackdropPath(path: string | null): this {
    this.data.backdrop_path = path;
    return this;
  }

  /**
   * Set a random backdrop path.
   */
  withRandomBackdropPath(): this {
    this.data.backdrop_path = `/${faker.string.uuid()}-backdrop.jpg`;
    return this;
  }

  /**
   * Set no backdrop path (null).
   */
  withoutBackdrop(): this {
    this.data.backdrop_path = null;
    return this;
  }

  /**
   * Set the rating.
   */
  withRating(rating: number): this {
    this.data.rating = rating;
    return this;
  }

  /**
   * Set a random rating between 1 and 10.
   */
  withRandomRating(): this {
    this.data.rating = faker.number.float({ min: 1, max: 10, precision: 0.1 });
    return this;
  }

  /**
   * Set a high rating (8-10).
   */
  withHighRating(): this {
    this.data.rating = faker.number.float({ min: 8, max: 10, precision: 0.1 });
    return this;
  }

  /**
   * Set a low rating (1-5).
   */
  withLowRating(): this {
    this.data.rating = faker.number.float({ min: 1, max: 5, precision: 0.1 });
    return this;
  }

  /**
   * Set the tags.
   */
  withTags(tags: string[]): this {
    this.data.tags = tags;
    return this;
  }

  /**
   * Add additional tags.
   */
  withAdditionalTags(...tags: string[]): this {
    this.data.tags = [...(this.data.tags ?? []), ...tags];
    return this;
  }

  /**
   * Set random tags.
   */
  withRandomTags(count?: number): this {
    const numTags = count ?? faker.number.int({ min: 1, max: 4 });
    this.data.tags = Array.from({ length: numTags }, () => faker.lorem.word());
    return this;
  }

  /**
   * Set no tags.
   */
  withoutTags(): this {
    this.data.tags = [];
    return this;
  }

  /**
   * Set the release year.
   */
  withYear(year: number): this {
    this.data.year = year;
    return this;
  }

  /**
   * Set a random year.
   */
  withRandomYear(min?: number, max?: number): this {
    this.data.year = faker.number.int({ min: min ?? 2000, max: max ?? 2030 });
    return this;
  }

  /**
   * Set the duration in minutes.
   */
  withDuration(minutes: number): this {
    this.data.duration = minutes;
    return this;
  }

  /**
   * Set a random duration.
   */
  withRandomDuration(): this {
    this.data.duration = faker.number.int({ min: 60, max: 200 });
    return this;
  }

  /**
   * Set a short duration (< 90 minutes).
   */
  withShortDuration(): this {
    this.data.duration = faker.number.int({ min: 60, max: 90 });
    return this;
  }

  /**
   * Set a long duration (> 150 minutes).
   */
  withLongDuration(): this {
    this.data.duration = faker.number.int({ min: 150, max: 200 });
    return this;
  }

  /**
   * Apply all defaults that haven't been explicitly set.
   */
  private applyDefaults(): void {
    this.data.id ??= this.defaults.id ?? faker.string.uuid();
    this.data.title ??= this.defaults.title ?? faker.lorem.words(3);
    this.data.description ??= this.defaults.description ?? faker.lorem.paragraph();
    this.data.poster_path ??= this.defaults.poster_path ?? `/${faker.string.uuid()}.jpg`;
    this.data.backdrop_path ??= this.defaults.backdrop_path ?? null;
    this.data.rating ??=
      this.defaults.rating ?? faker.number.float({ min: 1, max: 10, precision: 0.1 });
    this.data.tags ??= this.defaults.tags ?? [faker.lorem.word()];
    this.data.year ??= this.defaults.year ?? faker.number.int({ min: 2000, max: 2030 });
    this.data.duration ??= this.defaults.duration ?? faker.number.int({ min: 60, max: 200 });
  }

  // ==========================================================================
  // Build Methods
  // ==========================================================================

  /**
   * Build a single Movie object.
   */
  build(): Movie {
    this.applyDefaults();
    return this.data as Movie;
  }

  /**
   * Build multiple Movie objects with the same configuration.
   */
  buildMany(count: number): Movie[] {
    return Array.from({ length: count }, () => this.build());
  }

  /**
   * Build multiple Movie objects with unique IDs.
   */
  buildList(count: number): Movie[] {
    return Array.from({ length: count }, () => {
      this.applyDefaults();
      const movie = this.data as Movie;
      movie.id = faker.string.uuid();
      return { ...movie };
    });
  }

  /**
   * Reset the builder to its initial state.
   */
  reset(): this {
    this.data = {};
    return this;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a Movie with default values.
 */
export function movie(): MovieBuilder {
  return MovieBuilder.create();
}

/**
 * Create a Movie with random values.
 */
export function randomMovie(): MovieBuilder {
  return MovieBuilder.random();
}

/**
 * Create a specific well-known movie fixture.
 */
export function classicMovie(title: string, year: number): MovieBuilder {
  return MovieBuilder.create()
    .withTitle(title)
    .withYear(year)
    .withPosterPath(`/${title.toLowerCase().replace(/\s+/g, "-")}.jpg`)
    .withBackdropPath(`/${title.toLowerCase().replace(/\s+/g, "-")}-backdrop.jpg`)
    .withRating(8.5)
    .withDuration(120);
}

// ============================================================================
// Default Movie Templates
// ============================================================================

/**
 * Pre-defined templates for common test scenarios.
 */
export const MovieTemplates = {
  /**
   * A default movie template.
   */
  default: () =>
    MovieBuilder.create()
      .withTitle("Test Movie")
      .withDescription("A test movie description")
      .withRating(7.0)
      .withYear(2024)
      .withDuration(120)
      .build(),

  /**
   * A movie without a poster.
   */
  noPoster: () => MovieBuilder.create().withTitle("Movie Without Poster").withoutPoster().build(),

  /**
   * A movie with no backdrop.
   */
  noBackdrop: () =>
    MovieBuilder.create().withTitle("Movie Without Backdrop").withoutBackdrop().build(),

  /**
   * A movie with no tags.
   */
  noTags: () => MovieBuilder.create().withTitle("Movie Without Tags").withoutTags().build(),

  /**
   * A movie with a very long description.
   */
  longDescription: () =>
    MovieBuilder.create()
      .withTitle("Movie with Long Description")
      .withDescription(
        "This movie has an extremely long description that goes on and on. " +
          "It tells the story of a hero's journey through various trials and tribulations. " +
          "This is all just to test how the component handles long text.",
      )
      .build(),

  /**
   * A movie with a very high rating.
   */
  highRating: () => MovieBuilder.create().withTitle("Amazing Movie").withRating(9.9).build(),

  /**
   * A movie with a very low rating.
   */
  lowRating: () => MovieBuilder.create().withTitle("Terrible Movie").withRating(1.0).build(),

  /**
   * A very short movie.
   */
  short: () => MovieBuilder.create().withTitle("Short Film").withDuration(15).build(),

  /**
   * A very long movie.
   */
  long: () => MovieBuilder.create().withTitle("Epic Movie").withDuration(240).build(),

  /**
   * A movie from a long time ago.
   */
  old: () => MovieBuilder.create().withTitle("Classic Film").withYear(1920).build(),

  /**
   * A movie from the future (for testing date validation).
   */
  future: () => MovieBuilder.create().withTitle("Future Movie").withYear(2050).build(),
};
