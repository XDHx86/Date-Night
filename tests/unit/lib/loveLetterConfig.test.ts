/**
 * Unit tests for src/lib/loveLetterConfig.ts.
 *
 * Covers the love-letter feature flag (`isLoveLetterFeatureEnabled` /
 * `VITE_LOVE_LETTER_FEATURE`) and the existing category resolver
 * (`getActiveLoveLetterCategory` / `VITE_LOVE_LETTER_CATEGORY`).
 *
 * Every case stubs the env var explicitly before calling the function, so the
 * assertions are independent of whatever ambient `.env` Vitest happens to load.
 * `vi.unstubAllEnvs()` in the beforeEach/afterEach keeps stubs from leaking
 * between cases.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isLoveLetterFeatureEnabled,
  getActiveLoveLetterCategory,
  LOVE_LETTER_DISABLED_REDIRECT,
} from "../../../src/lib/loveLetterConfig";

describe("loveLetterConfig — feature flag", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("is enabled when the var is unset/empty", () => {
    vi.stubEnv("VITE_LOVE_LETTER_FEATURE", "");
    expect(isLoveLetterFeatureEnabled()).toBe(true);
  });

  it('is disabled only when the value is "disabled"', () => {
    vi.stubEnv("VITE_LOVE_LETTER_FEATURE", "disabled");
    expect(isLoveLetterFeatureEnabled()).toBe(false);
  });

  it('treats "disabled" case- and whitespace-insensitively', () => {
    vi.stubEnv("VITE_LOVE_LETTER_FEATURE", " DISABLED ");
    expect(isLoveLetterFeatureEnabled()).toBe(false);
  });

  it("stays enabled for any other value", () => {
    vi.stubEnv("VITE_LOVE_LETTER_FEATURE", "enabled");
    expect(isLoveLetterFeatureEnabled()).toBe(true);
    vi.stubEnv("VITE_LOVE_LETTER_FEATURE", "on");
    expect(isLoveLetterFeatureEnabled()).toBe(true);
  });

  it("exports the home page as the disabled-redirect fallback", () => {
    expect(LOVE_LETTER_DISABLED_REDIRECT).toBe("/");
  });
});

describe("loveLetterConfig — category resolver", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("resolves a valid category", () => {
    vi.stubEnv("VITE_LOVE_LETTER_CATEGORY", "birthday");
    expect(getActiveLoveLetterCategory()).toBe("birthday");
  });

  it("falls back to default and warns for an unknown value", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("VITE_LOVE_LETTER_CATEGORY", "banana");
    expect(getActiveLoveLetterCategory()).toBe("default");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("defaults to the default category when unset/empty", () => {
    vi.stubEnv("VITE_LOVE_LETTER_CATEGORY", "");
    expect(getActiveLoveLetterCategory()).toBe("default");
  });
});
