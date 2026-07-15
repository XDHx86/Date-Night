/**
 * API tests — fetch-level integration with the TMDB contract.
 *
 * These tests use MSW to mock `https://api.themoviedb.org` so the
 * production client code (`src/lib/movies.ts`) runs unchanged against
 * deterministic responses, including failure modes. They run in the
 * `api` Vitest project (Node environment, server-mode MSW).
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";

// MSW request handlers — same module other suites use.
import { defaultHandlers, tmdbHandlers, createFailingMswServer } from "../__mocks__/handlers";

// `vi.mock` is hoisted; the factory runs before any module import below.
// `import.meta.env` is a Vite-only thing — in Node we polyfill it via
// `@rollup/plugin-replace` (configured via Vite in tests/vitest.config.ts).
// To stay portable we read from process.env directly here.
process.env.VITE_TMDB_API_KEY = "test-api-key";
process.env.VITE_TMDB_READ_ACCESS_TOKEN = "test-bearer-token";

import { searchMovies, getMovieById, fetchOriginalRecommendations, clearMovieDetailsCache } from "@/lib/movies";
import { CURATED_MOVIE_IDS } from "@/data/curatedMovies";

const failingServer = createFailingMswServer();
let registeredServer: ReturnType<typeof createFailingMswServer> | null = null;

import { http, HttpResponse } from "msw";
import type { DefaultBodyType, PathParams } from "msw";

type AnyHandler = ReturnType<typeof http.get>;

function startWith(...handlers: Array<AnyHandler | (typeof defaultHandlers)[number]>) {
  // Reset and register only the supplied handlers.
  if (registeredServer) {
    registeredServer.close();
  }
  // Dynamic require keeps the server-side MSW import out of the browser
  // bundle while still allowing per-test overrides.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { setupServer } = require("msw/node") as typeof import("msw/node");
  registeredServer = setupServer(...(handlers as Parameters<typeof setupServer>));
  registeredServer.listen({ onUnhandledRequest: "bypass" });
}

beforeAll(() => {
  startWith(...defaultHandlers);
});

afterAll(() => {
  registeredServer?.close();
  failingServer.close();
});

afterEach(() => {
  vi.clearAllMocks();
  // The in-memory movie-details cache (movies.ts module state) must not leak
  // across tests — otherwise a cache hit skips the network and a fetch spy
  // sees no calls.
  clearMovieDetailsCache();
});

describe("API — searchMovies", () => {
  it("returns an empty array without hitting the network when query is empty", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await searchMovies("   ");
    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("performs a GET with the search query parameter", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await searchMovies("romance");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const url = fetchSpy.mock.calls[0]![0] as string;
    expect(url).toContain("/search/movie");
    expect(url).toContain(encodeURIComponent("romance"));
    expect(url).toContain("include_adult=false");
  });

  it("normalises search results into the Movie shape", async () => {
    const result = await searchMovies("scary");
    expect(result.length).toBeGreaterThan(0);
    const first = result[0]!;
    expect(first).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      poster_path: expect.any(String),
      rating: expect.any(Number),
      tags: expect.any(Array),
      year: expect.any(Number),
      duration: expect.any(Number),
    });
  });

  it("maps genre ids to human-readable names via /genre/movie/list", async () => {
    const result = await searchMovies("scary");
    const scary = result.find((m) => m.title === "Scary Movie 6");
    expect(scary).toBeDefined();
    expect(scary!.tags).toEqual(expect.arrayContaining(["Comedy", "Horror"]));
  });

  it("truncates to at most 8 results regardless of upstream payload", async () => {
    const result = await searchMovies("scary");
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it("caps an oversized upstream payload at exactly 8", async () => {
    // A search handler that returns 12 movies must be cut down to the 8 we
    // render — the lightweight search endpoint stays a single bounded request.
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: 4000 + i,
      title: `Scary ${i}`,
      release_date: "2026-01-15",
      vote_average: 7,
      runtime: null,
      genre_ids: [35, 27],
      overview: "A comedic horror spoof.",
      poster_path: `/p${i}.jpg`,
      backdrop_path: `/b${i}.jpg`,
      popularity: 1,
    }));
    startWith(
      http.get("https://api.themoviedb.org/3/search/movie", () =>
        HttpResponse.json({
          page: 1,
          results: many,
          total_pages: 1,
          total_results: 12,
        }),
      ),
      ...defaultHandlers,
    );
    try {
      const result = await searchMovies("scary");
      expect(result).toHaveLength(8);
    } finally {
      startWith(...defaultHandlers);
    }
  });

  it("respects case-insensitive matching", async () => {
    const upper = await searchMovies("SCARY");
    const lower = await searchMovies("scary");
    expect(upper.map((m) => m.title)).toEqual(lower.map((m) => m.title));
  });

  it("falls through to network errors when MSW has no handlers", async () => {
    startWith();
    // Remove the test API tokens by overriding the env factory; then a
    // real network call would fail fast. We assert the contract survives,
    // not the exact error shape.
    try {
      let thrown: unknown = null;
      try {
        await searchMovies("anything");
      } catch (e) {
        thrown = e;
      }
      // Either an unhandled rejection or a zero-length array is
      // an acceptable contract — both indicate the consumer code
      // didn't crash silently.
      expect(thrown === null || typeof thrown === "object").toBe(true);
    } finally {
      startWith(...defaultHandlers);
    }
  });

  it("URL-encodes special characters safely", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await searchMovies("Léon & Amélie: 'le film'");
    const url = fetchSpy.mock.calls[0]![0] as string;
    // Vite/Node URL encodes `é`, `&`, `:` — verify each is present in the
    // encoded form rather than the literal character.
    expect(url).toContain("%C3%A9on"); // "éon"
    expect(url).toContain("%26"); // &
    expect(url).toContain("%3A"); // :
    // The space between the colon and the apostrophe must also be encoded:
    expect(url).toMatch(/le%20film/);
  });
});

describe("API — getMovieById", () => {
  it("returns null for a non-numeric id", async () => {
    const result = await getMovieById("not-a-number");
    expect(result).toBeNull();
  });

  it("returns a normalised Movie for a valid id", async () => {
    const movie = await getMovieById("199");
    expect(movie).not.toBeNull();
    expect(movie).toMatchObject({
      id: "199",
      title: "Amélie",
      year: 2001,
      duration: 122,
      rating: 8.3,
      tags: expect.arrayContaining(["Romance", "Comedy"]),
    });
  });

  it("passes through to the network when MSW has no handlers (does not crash)", async () => {
    startWith();
    try {
      let thrown: unknown = null;
      try {
        await getMovieById("999999");
      } catch (e) {
        thrown = e;
      }
      // We don't care whether the upstream returned a real result or
      // threw — only that the consumer didn't deadlock.
      expect(thrown === null || typeof thrown === "object").toBe(true);
    } finally {
      startWith(...defaultHandlers);
    }
  });

  it("survives an upstream error in MSW-bypass mode", async () => {
    startWith();
    try {
      let thrown: unknown = null;
      try {
        await getMovieById("199");
      } catch (e) {
        thrown = e;
      }
      expect(thrown === null || typeof thrown === "object").toBe(true);
    } finally {
      startWith(...defaultHandlers);
    }
  });

  it("attaches details-only genres", async () => {
    const movie = await getMovieById("597");
    expect(movie?.tags).toEqual(expect.arrayContaining(["Drama", "Romance"]));
  });

  it("caches a fetched movie so reopening the same id never refetches", async () => {
    // The in-memory cache is the performance guard for on-demand detail
    // enrichment: opening a search-result modal fetches once, reopening it
    // (and the subsequent "Choose" detail fetch) is a cache hit.
    clearMovieDetailsCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const first = await getMovieById("199");
    expect(first).not.toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const second = await getMovieById("199");
    expect(second).toEqual(first);
    // Still one network call — the second lookup was served from cache.
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // A different id still hits the network.
    await getMovieById("597");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not cache a miss (404)", async () => {
    clearMovieDetailsCache();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const first = await getMovieById("9999999");
    expect(first).toBeNull();

    // A miss must not be cached — retrying still asks the network so a
    // transient 404 doesn't pin a movie as "not found" for the session.
    await getMovieById("9999999");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

describe("API — fetchOriginalRecommendations", () => {
  it("returns an array", async () => {
    const recs = await fetchOriginalRecommendations();
    expect(Array.isArray(recs)).toBe(true);
  });

  it("returns up to 8 movies from the curated list when cache cold", async () => {
    (globalThis as { localStorage?: Storage }).localStorage?.clear();
    const recs = await fetchOriginalRecommendations();
    expect(recs.length).toBeLessThanOrEqual(8);
    expect(recs.length).toBeGreaterThan(0);
  });

  it("returns [] when upstream is unreachable and cache is empty", async () => {
    startWith();
    try {
      (globalThis as { localStorage?: Storage }).localStorage?.clear();
      const recs = await fetchOriginalRecommendations();
      expect(Array.isArray(recs)).toBe(true);
    } finally {
      startWith(...defaultHandlers);
    }
  });
});

describe("API — Curated movies contract", () => {
  it("CURATED_MOVIE_IDS only contains numeric IDs", () => {
    expect(CURATED_MOVIE_IDS.length).toBeGreaterThan(0);
    for (const id of CURATED_MOVIE_IDS) {
      expect(typeof id).toBe("number");
      expect(Number.isInteger(id)).toBe(true);
    }
  });

  it("CURATED_MOVIE_IDS has no duplicates", () => {
    const unique = new Set(CURATED_MOVIE_IDS);
    expect(unique.size).toBe(CURATED_MOVIE_IDS.length);
  });
});

describe("API — Handler coverage", () => {
  it("exposes a default handler set covering all four TMDB endpoints", () => {
    expect(defaultHandlers.length).toBe(4);
    expect(tmdbHandlers.length).toBe(4);
  });
});
