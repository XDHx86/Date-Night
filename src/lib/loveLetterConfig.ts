/**
 * Reads the active love‑letter category from Vite's env.
 * Falls back gracefully if the variable is missing or invalid,
 * so the app always has a working default.
 */

import { categories, type Category } from "@/data/loveLetters";

const DEFAULT_CATEGORY: Category = "default";

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
