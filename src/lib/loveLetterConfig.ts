/**
 * Reads the active love‑letter category from Vite's env.
 * Falls back gracefully if the variable is missing or invalid,
 * so the app always has a working default.
 *
 * Also exposes the love‑letter feature flag: setting
 * `VITE_LOVE_LETTER_FEATURE="disabled"` removes the page, its nav entry and
 * every CTA from the experience (the `/love‑letter` route redirects away).
 * Any other value — or leaving it unset — keeps the feature on, so the
 * default is "enabled" and the toggle is opt‑out only.
 */

import { categories, type Category } from "@/data/loveLetters";

const DEFAULT_CATEGORY: Category = "default";

/** The env value that disables the love‑letter feature (case‑/whitespace‑insensitive). */
const LOVE_LETTER_DISABLED_VALUE = "disabled";

/**
 * Where `/love‑letter` redirects when the feature is disabled. The home/landing
 * page is the canonical entry point and the universal safe fallback for a
 * feature that's off everywhere.
 */
export const LOVE_LETTER_DISABLED_REDIRECT = "/" as const;

/**
 * Resolves whether the love‑letter feature is enabled at build/dev time.
 * Reads `VITE_LOVE_LETTER_FEATURE`; set it to `"disabled"` to remove the
 * feature entirely (route redirects away, nav/CTAs are hidden, flows skip it).
 * Any other value — or leaving it unset — keeps the feature on.
 */
export function isLoveLetterFeatureEnabled(): boolean {
  const raw = import.meta.env.VITE_LOVE_LETTER_FEATURE as string | undefined;
  if (raw && typeof raw === "string") {
    return raw.trim().toLowerCase() !== LOVE_LETTER_DISABLED_VALUE;
  }
  return true;
}

const isCategory = (value: string): value is Category =>
  (categories as readonly string[]).includes(value);

/**
 * Resolves the active Category at runtime.
 * Reads `VITE_LOVE_LETTER_CATEGORY` and validates it against the known list.
 */
export function getActiveLoveLetterCategory(): Category {
  // Vite exposes import.meta.env at build/dev time.
  const raw = import.meta.env.VITE_LOVE_LETTER_CATEGORY as string | undefined;

  if (raw && typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (isCategory(normalized)) {
      return normalized;
    }
    // If the value is invalid, warn once so it’s noticeable during dev.
    // eslint-disable-next-line no-console
    console.warn(
      `[loveLetterConfig] Unrecognized VITE_LOVE_LETTER_CATEGORY: "${raw}". ` +
        `Falling back to "${DEFAULT_CATEGORY}".`,
    );
  }
  return DEFAULT_CATEGORY;
}
