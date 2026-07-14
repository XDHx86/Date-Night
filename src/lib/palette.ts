/**
 * Romance color palettes used by the randomized decoration systems
 * (floating particles, confetti, heart bursts, sparkle trails, seasonal layers).
 *
 * Kept as OKLCH strings so every particle picks a distinct, on-brand color and
 * nothing reads the same twice — the anti-predictability pillar.
 */

/** Warm romance palette — hearts, petals, the year-round base. */
export const HEART_COLORS = [
  "oklch(0.66 0.2 8)", // blush rose
  "oklch(0.74 0.19 25)", // coral
  "oklch(0.78 0.16 40)", // peach
  "oklch(0.82 0.12 75)", // soft gold
  "oklch(0.7 0.14 295)", // dreamy violet
  "oklch(0.7 0.13 230)", // sky
];

/** Confetti pieces — brightened so they pop against the mesh. */
export const CONFETTI_COLORS = [
  "oklch(0.7 0.2 8)",
  "oklch(0.76 0.16 38)",
  "oklch(0.83 0.13 75)",
  "oklch(0.72 0.15 295)",
  "oklch(0.7 0.14 230)",
  "oklch(0.62 0.17 320)", // a magenta kiss
];

/** Sparkle trails — pastel twinkle tones. */
export const SPARKLE_COLORS = [
  "oklch(0.85 0.12 60)",
  "oklch(0.8 0.14 40)",
  "oklch(0.82 0.13 295)",
  "oklch(0.78 0.13 10)",
  "oklch(0.84 0.1 75)",
];

/** Petal shades for spring / petal-shower celebrations. */
export const PETAL_COLORS = [
  "oklch(0.84 0.1 350)", // blossom pink
  "oklch(0.86 0.09 20)", // warm white-pink
  "oklch(0.83 0.1 5)",
  "oklch(0.85 0.08 50)",
];

/** Pick a random entry from any list. */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
