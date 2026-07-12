/**
 * Node-environment setup for tests that don't need a real DOM.
 *
 * Polyfills:
 *   • `localStorage` + `sessionStorage` — in-memory stores for jsdom-less
 *     suites (e.g. `api`, `smoke` Vitest projects).
 *   • `performance.now` — for tests that measure timing.
 *
 * Use this setup file when the test only touches env, store, or
 * fetch-level integration; full DOM-heavy tests use `test-setup.ts`.
 */

import { afterEach, vi, beforeAll } from "vitest";

const memoryStore = (): Storage => {
  const internal: Record<string, string> = {};
  return {
    getItem: (k) => (k in internal ? internal[k] : null),
    setItem: (k, v) => {
      internal[k] = String(v);
    },
    removeItem: (k) => {
      delete internal[k];
    },
    clear: () => {
      for (const k of Object.keys(internal)) delete internal[k];
    },
    key: (i) => Object.keys(internal)[i] ?? null,
    get length() {
      return Object.keys(internal).length;
    },
  } as unknown as Storage;
};

beforeAll(() => {
  // Polyfill the global `localStorage` only if missing — jsdom-equipped
  // projects already have a real one.
  if (typeof globalThis.localStorage === "undefined") {
    Object.defineProperty(globalThis, "localStorage", {
      value: memoryStore(),
      writable: true,
      configurable: true,
    });
  }
  if (typeof globalThis.sessionStorage === "undefined") {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: memoryStore(),
      writable: true,
      configurable: true,
    });
  }
  if (typeof globalThis.performance === "undefined") {
    // @ts-expect-error — fine to attach a minimal perf implementation
    globalThis.performance = { now: () => Date.now() };
  }
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
