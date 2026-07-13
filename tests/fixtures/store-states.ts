/**
 * Test fixtures for Zustand store states.
 * These are pre-defined store states for use in tests.
 */

import type { DateState } from "../../src/lib/store";
import { mockMovie, mockHighRatedMovie, mockMovies } from "./movies";

// ============================================================================
// Initial State
// ============================================================================

/**
 * The initial state of the store (all values null/default).
 */
export const initialStoreState: DateState = {
  date: null,
  time: null,
  movie: null,
  isDarkMode: false,
  isAudioEnabled: true,
  loveMessage: "You are my sunshine on a cloudy day. ☀️",

  // Actions (we'll mock these in tests)
  setDate: vi.fn(),
  setTime: vi.fn(),
  setMovie: vi.fn(),
  reset: vi.fn(),
  toggleDarkMode: vi.fn(),
  setDarkMode: vi.fn(),
  toggleAudio: vi.fn(),
  setAudioEnabled: vi.fn(),
  setLoveMessage: vi.fn(),
};

// ============================================================================
// Partial States
// ============================================================================

/**
 * Store state with only date set.
 */
export const storeStateWithDate: Partial<DateState> = {
  date: "2026-07-12",
  time: null,
  movie: null,
};

/**
 * Store state with only time set.
 */
export const storeStateWithTime: Partial<DateState> = {
  date: null,
  time: "19:00",
  movie: null,
};

/**
 * Store state with only movie set.
 */
export const storeStateWithMovie: Partial<DateState> = {
  date: null,
  time: null,
  movie: mockMovie,
};

/**
 * Store state with date and time set (ready for movie selection).
 */
export const storeStateDateAndTime: Partial<DateState> = {
  date: "2026-07-12",
  time: "19:00",
  movie: null,
};

/**
 * Store state with date, time, and movie set (ready for summary).
 */
export const storeStateCompleteSelection: Partial<DateState> = {
  date: "2026-07-12",
  time: "19:00",
  movie: mockMovie,
};

// ============================================================================
// Full States
// ============================================================================

/**
 * Complete store state with all values set (for testing summary/success pages).
 */
export const completeStoreState: DateState = {
  date: "2026-07-12",
  time: "19:00",
  movie: mockHighRatedMovie,
  isDarkMode: false,
  isAudioEnabled: true,
  loveMessage: "I love you more than words can say! ❤️",

  // Mock actions
  setDate: vi.fn(),
  setTime: vi.fn(),
  setMovie: vi.fn(),
  reset: vi.fn(),
  toggleDarkMode: vi.fn(),
  setDarkMode: vi.fn(),
  toggleAudio: vi.fn(),
  setAudioEnabled: vi.fn(),
  setLoveMessage: vi.fn(),
};

/**
 * Store state with dark mode enabled.
 */
export const darkModeStoreState: DateState = {
  ...completeStoreState,
  isDarkMode: true,
};

/**
 * Store state with audio disabled.
 */
export const audioDisabledStoreState: DateState = {
  ...completeStoreState,
  isAudioEnabled: false,
};

/**
 * Store state with custom love message.
 */
export const customLoveMessageStoreState: DateState = {
  ...completeStoreState,
  loveMessage: "To the most amazing person I know - let's make this night unforgettable!",
};

// ============================================================================
// Edge Cases
// ============================================================================

/**
 * Store state with very old date.
 */
export const oldDateStoreState: Partial<DateState> = {
  date: "2000-01-01",
  time: "00:00",
  movie: mockMovie,
};

/**
 * Store state with date in the past.
 */
export const pastDateStoreState: Partial<DateState> = {
  date: "2023-01-01",
  time: "12:00",
  movie: mockMovie,
};

/**
 * Store state with very long love message.
 */
export const longLoveMessageStoreState: Partial<DateState> = {
  loveMessage:
    "My dearest love, from the moment I first saw you, I knew my life would never be the same. " +
    "You have brought so much joy, happiness, and meaning to my world. " +
    "Every day with you is a new adventure, and I wake up each morning " +
    "thankful that I get to share my life with someone as incredible as you. " +
    "You are my best friend, my partner, my soulmate, and my greatest love. " +
    "I promise to cherish you, support you, and love you unconditionally for all of our days. " +
    "Thank you for being you. ❤️",
};

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Options for creating a custom store state.
 */
export interface CreateStoreStateOptions {
  date?: string | null;
  time?: string | null;
  movie?: object | null;
  isDarkMode?: boolean;
  isAudioEnabled?: boolean;
  loveMessage?: string;
  withActions?: boolean;
}

/**
 * Factory function for creating custom store states.
 */
export function createStoreState(options: CreateStoreStateOptions = {}): DateState {
  const base: DateState = {
    date: options.date ?? null,
    time: options.time ?? null,
    movie: (options.movie as any) ?? null,
    isDarkMode: options.isDarkMode ?? false,
    isAudioEnabled: options.isAudioEnabled ?? true,
    loveMessage: options.loveMessage ?? "You are my sunshine on a cloudy day. ☀️",

    // Actions
    setDate: options.withActions ? vi.fn() : vi.fn(),
    setTime: options.withActions ? vi.fn() : vi.fn(),
    setMovie: options.withActions ? vi.fn() : vi.fn(),
    reset: options.withActions ? vi.fn() : vi.fn(),
    toggleDarkMode: options.withActions ? vi.fn() : vi.fn(),
    setDarkMode: options.withActions ? vi.fn() : vi.fn(),
    toggleAudio: options.withActions ? vi.fn() : vi.fn(),
    setAudioEnabled: options.withActions ? vi.fn() : vi.fn(),
    setLoveMessage: options.withActions ? vi.fn() : vi.fn(),
  };

  return base;
}

/**
 * Create a store state with all selections complete.
 */
export function createCompleteStoreState(
  overrides: Partial<CreateStoreStateOptions> = {},
): DateState {
  return createStoreState({
    date: "2026-07-12",
    time: "19:00",
    movie: mockMovie,
    withActions: true,
    ...overrides,
  });
}

/**
 * Create an empty/reset store state.
 */
export function createEmptyStoreState(): DateState {
  return createStoreState({
    date: null,
    time: null,
    movie: null,
    isDarkMode: false,
    isAudioEnabled: true,
    withActions: true,
  });
}
