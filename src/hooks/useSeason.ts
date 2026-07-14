import { useMemo } from "react";

export type Season = "valentine" | "spring" | "summer" | "autumn" | "winter";

export interface SeasonTheme {
  season: Season;
  /** Themed floating glyphs layered over the year-round heart/sparkle base. */
  glyphs: string[];
  /** Themed colors for those glyphs / celebration variants. */
  colors: string[];
  /** A short, charming label (unused in the UI, handy for seasonal copy). */
  label: string;
}

/**
 * Seasonal easter-egg layer. The month of the year quietly re-themes the
 * floating decorations and gives celebrations a seasonal flavor:
 *
 *   Feb         -> Valentine (hearts & roses flair)
 *   Mar-May     -> spring (cherry-blossom petals)
 *   Jun-Aug     -> summer (fireflies & gold)
 *   Sep-Nov     -> autumn (amber leaves)
 *   Dec-Jan     -> winter (snowflakes & wintergreen)
 *
 * Capped so it reads as a subtle seasonal tint over the year-round hearts,
 * never a takeover. Determined from the current UTC month so it lines up
 * regardless of the user's hemisphere — this is a vibe, not weather.
 */
export const SEASONS: Record<Season, SeasonTheme> = {
  valentine: {
    season: "valentine",
    glyphs: ["\u{1F49D}", "\u{1F339}", "\u{1F498}", "\u{1F49E}", "\u{1F380}", "\u{1F56F}"],
    colors: ["oklch(0.66 0.2 8)", "oklch(0.7 0.17 20)", "oklch(0.72 0.16 340)", "oklch(0.8 0.13 40)"],
    label: "Valentine's flair",
  },
  spring: {
    season: "spring",
    glyphs: ["\u{1F338}", "\u{1F337}", "\u{1F33C}", "\u{1F98B}", "\u{1F343}", "\u{1F33A}"],
    colors: ["oklch(0.84 0.1 350)", "oklch(0.83 0.1 5)", "oklch(0.85 0.09 20)", "oklch(0.82 0.1 95)"],
    label: "Cherry-blossom spring",
  },
  summer: {
    season: "summer",
    glyphs: ["☀️", "✨", "\u{1F319}", "\u{1F31E}", "\u{1F30A}", "\u{1F33B}"],
    colors: ["oklch(0.86 0.12 75)", "oklch(0.82 0.13 40)", "oklch(0.8 0.1 230)", "oklch(0.85 0.11 95)"],
    label: "Golden summer",
  },
  autumn: {
    season: "autumn",
    glyphs: ["\u{1F342}", "\u{1F341}", "\u{1F330}", "\u{1F33E}", "\u{1F994}", "\u{1FAB5}"],
    colors: ["oklch(0.66 0.15 45)", "oklch(0.6 0.16 30)", "oklch(0.55 0.13 25)", "oklch(0.7 0.1 60)"],
    label: "Amber autumn",
  },
  winter: {
    season: "winter",
    glyphs: ["❄️", "⛄", "✨", "\u{1F328}️", "\u{1FA90}", "\u{1F319}"],
    colors: ["oklch(0.86 0.06 240)", "oklch(0.88 0.05 200)", "oklch(0.82 0.1 295)", "oklch(0.85 0.08 230)"],
    label: "Snowflake winter",
  },
};

function seasonForMonth(month: number): Season {
  if (month === 1) return "valentine"; // February (0-indexed)
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter"; // December & January
}

/**
 * Returns the active seasonal theme for the current month.
 * Computed once per component lifetime; SSR-safe (no window access).
 */
export function useSeason(): SeasonTheme {
  const theme = useMemo(() => {
    // `new Date()` is fine here — this runs at hook evaluation time in the
    // browser (SPA, no SSR/hydration mismatch concern), and the season only
    // shifts across calendar months.
    const month = typeof Date !== "undefined" ? new Date().getMonth() : 0;
    return SEASONS[seasonForMonth(month)];
  }, []);
  return theme;
}
