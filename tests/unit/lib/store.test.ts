/**
 * Unit tests for Zustand store (useDateStore).
 * Tests cover actions, selectors, persistence, and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage before importing the store
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    length: Object.keys(store).length,
  };
})();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    length: Object.keys(store).length,
  };
})();

// Apply mocks
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });
Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorageMock });

// Now import the store
import { useDateStore, create } from "../../../src/lib/store";
import type { DateState } from "../../../src/lib/store";

describe("useDateStore", () => {
  // Clear all mocks and storage before each test
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();

    // Recreate the store to ensure clean state
    // Note: Zustand store is a singleton, so we need to reset it
    vi.spyOn(localStorage, "getItem").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial State Tests
  // ==========================================================================

  describe("Initial State", () => {
    it("should return initial state with all null values", () => {
      // Reset the store by clearing persistence
      localStorageMock.clear();

      const state = useDateStore.getState();

      expect(state.date).toBeNull();
      expect(state.time).toBeNull();
      expect(state.movie).toBeNull();
      // Default values
      expect(state.isDarkMode).toBe(false);
      expect(state.isAudioEnabled).toBe(true);
      expect(state.loveMessage).toBe("You are my sunshine on a cloudy day. ☀️");
    });
  });

  // ==========================================================================
  // Action Tests - Date
  // ==========================================================================

  describe("Date Actions", () => {
    it("should set date using setDate", () => {
      const { setDate } = useDateStore.getState();

      setDate("2026-07-12");

      const state = useDateStore.getState();
      expect(state.date).toBe("2026-07-12");
    });

    it("should update date with a new value", () => {
      const { setDate } = useDateStore.getState();

      setDate("2026-07-12");
      setDate("2026-07-15");

      const state = useDateStore.getState();
      expect(state.date).toBe("2026-07-15");
    });

    it("should allow setting date to null", () => {
      const { setDate } = useDateStore.getState();

      setDate("2026-07-12");
      setDate(null as unknown as string);

      const state = useDateStore.getState();
      // Note: The store implementation sets date to whatever is passed
      // In practice, null would be passed as null
      expect(state.date).toBeNull();
    });
  });

  // ==========================================================================
  // Action Tests - Time
  // ==========================================================================

  describe("Time Actions", () => {
    it("should set time using setTime", () => {
      const { setTime } = useDateStore.getState();

      setTime("19:30");

      const state = useDateStore.getState();
      expect(state.time).toBe("19:30");
    });

    it("should update time with a new value", () => {
      const { setTime } = useDateStore.getState();

      setTime("18:00");
      setTime("20:00");

      const state = useDateStore.getState();
      expect(state.time).toBe("20:00");
    });

    it("should accept 24-hour format times", () => {
      const { setTime } = useDateStore.getState();

      setTime("23:59");

      const state = useDateStore.getState();
      expect(state.time).toBe("23:59");

      setTime("00:00");
      expect(useDateStore.getState().time).toBe("00:00");
    });
  });

  // ==========================================================================
  // Action Tests - Movie
  // ==========================================================================

  describe("Movie Actions", () => {
    const mockMovie = {
      id: "123",
      title: "Test Movie",
      description: "A test movie",
      poster_path: "/test.jpg",
      backdrop_path: "/test-backdrop.jpg",
      rating: 7.5,
      tags: ["Action"],
      year: 2024,
      duration: 120,
    };

    it("should set movie using setMovie", () => {
      const { setMovie } = useDateStore.getState();

      setMovie(mockMovie as any);

      const state = useDateStore.getState();
      expect(state.movie).toEqual(mockMovie);
    });

    it("should nullify movie when setMovie is called with null", () => {
      const { setMovie } = useDateStore.getState();

      setMovie(mockMovie as any);
      setMovie(null as any);

      const state = useDateStore.getState();
      // Depending on implementation, this might be null or undefined
      expect(state.movie).toBeFalsy();
    });
  });

  // ==========================================================================
  // Action Tests - Dark Mode
  // ==========================================================================

  describe("Dark Mode Actions", () => {
    it("should toggle dark mode using toggleDarkMode", () => {
      const { toggleDarkMode } = useDateStore.getState();

      // Initial state
      expect(useDateStore.getState().isDarkMode).toBe(false);

      // First toggle
      toggleDarkMode();
      expect(useDateStore.getState().isDarkMode).toBe(true);

      // Second toggle
      toggleDarkMode();
      expect(useDateStore.getState().isDarkMode).toBe(false);
    });

    it("should set dark mode directly using setDarkMode", () => {
      const { setDarkMode } = useDateStore.getState();

      setDarkMode(true);
      expect(useDateStore.getState().isDarkMode).toBe(true);

      setDarkMode(false);
      expect(useDateStore.getState().isDarkMode).toBe(false);
    });
  });

  // ==========================================================================
  // Action Tests - Audio
  // ==========================================================================

  describe("Audio Actions", () => {
    it("should toggle audio using toggleAudio", () => {
      const { toggleAudio } = useDateStore.getState();

      // Initial state
      expect(useDateStore.getState().isAudioEnabled).toBe(true);

      // First toggle
      toggleAudio();
      expect(useDateStore.getState().isAudioEnabled).toBe(false);

      // Second toggle
      toggleAudio();
      expect(useDateStore.getState().isAudioEnabled).toBe(true);
    });

    it("should set audio directly using setAudioEnabled", () => {
      const { setAudioEnabled } = useDateStore.getState();

      setAudioEnabled(false);
      expect(useDateStore.getState().isAudioEnabled).toBe(false);

      setAudioEnabled(true);
      expect(useDateStore.getState().isAudioEnabled).toBe(true);
    });
  });

  // ==========================================================================
  // Action Tests - Love Message
  // ==========================================================================

  describe("Love Message Actions", () => {
    it("should set love message using setLoveMessage", () => {
      const { setLoveMessage } = useDateStore.getState();

      setLoveMessage("I love you!");

      const state = useDateStore.getState();
      expect(state.loveMessage).toBe("I love you!");
    });

    it("should update love message with emoji", () => {
      const { setLoveMessage } = useDateStore.getState();

      setLoveMessage("You are amazing! ❤️");

      const state = useDateStore.getState();
      expect(state.loveMessage).toBe("You are amazing! ❤️");
    });

    it("should handle long love messages", () => {
      const { setLoveMessage } = useDateStore.getState();
      const longMessage = "A".repeat(1000);

      setLoveMessage(longMessage);

      const state = useDateStore.getState();
      expect(state.loveMessage).toBe(longMessage);
    });
  });

  // ==========================================================================
  // Reset Action Tests
  // ==========================================================================

  describe("Reset Actions", () => {
    it("should reset all state to initial values using reset", () => {
      const {
        setDate,
        setTime,
        setMovie,
        setDarkMode,
        setAudioEnabled,
        setLoveMessage,
        reset,
      } = useDateStore.getState();

      // Set all values
      setDate("2026-07-12");
      setTime("19:00");
      setMovie({ id: "123", title: "Test" } as any);
      setDarkMode(true);
      setAudioEnabled(false);
      setLoveMessage("Custom message");

      // Verify state is set
      expect(useDateStore.getState().date).toBe("2026-07-12");
      expect(useDateStore.getState().time).toBe("19:00");
      expect(useDateStore.getState().movie).toEqual({ id: "123", title: "Test" });
      expect(useDateStore.getState().isDarkMode).toBe(true);
      expect(useDateStore.getState().isAudioEnabled).toBe(false);
      expect(useDateStore.getState().loveMessage).toBe("Custom message");

      // Reset
      reset();

      // Verify state is reset
      const state = useDateStore.getState();
      expect(state.date).toBeNull();
      expect(state.time).toBeNull();
      expect(state.movie).toBeNull();
      expect(state.isDarkMode).toBe(false);
      // Audio preference should be preserved across reset
      expect(state.isAudioEnabled).toBe(false);
      expect(state.loveMessage).toBe("You are my sunshine on a cloudy day. ☀️");
    });
  });

  // ==========================================================================
  // Selector Tests
  // ==========================================================================

  describe("Selectors", () => {
    it("should be able to select specific state values", () => {
      const { setDate, setTime, setMovie } = useDateStore.getState();

      setDate("2026-07-12");
      setTime("19:00");
      setMovie({ id: "123", title: "Test" } as any);

      // Select specific values
      const justDate = useDateStore.getState().date;
      const justTime = useDateStore.getState().time;
      const justMovie = useDateStore.getState().movie;

      expect(justDate).toBe("2026-07-12");
      expect(justTime).toBe("19:00");
      expect(justMovie).toEqual({ id: "123", title: "Test" });
    });

    it("should be able to select multiple values together", () => {
      const { setDate, setTime } = useDateStore.getState();

      setDate("2026-07-12");
      setTime("19:00");

      const { date, time } = useDateStore.getState();

      expect(date).toBe("2026-07-12");
      expect(time).toBe("19:00");
    });
  });

  // ==========================================================================
  // Persistence Tests
  // ==========================================================================

  describe("Persistence", () => {
    // Note: The actual persistence depends on the store configuration
    // These tests verify the store's persistence behavior

    it("should call setItem when state changes (if persistence is configured)", () => {
      // This test depends on the store having persistence middleware
      // The store uses localStorage for persistence

      const { setDate } = useDateStore.getState();

      // Clear and spy on localStorage
      localStorageMock.clear();
      vi.spyOn(localStorage, "setItem");

      setDate("2026-07-12");

      // Check if localStorage.setItem was called
      // The store might batch updates or use a different storage key
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe("Edge Cases", () => {
    it("should handle multiple rapid state updates", () => {
      const { setDate, setTime, toggleDarkMode } = useDateStore.getState();

      // Rapid updates
      setDate("2026-01-01");
      setDate("2026-01-02");
      setDate("2026-01-03");
      setTime("10:00");
      setTime("11:00");
      toggleDarkMode();
      toggleDarkMode();

      const state = useDateStore.getState();
      expect(state.date).toBe("2026-01-03");
      expect(state.time).toBe("11:00");
      expect(state.isDarkMode).toBe(false);
    });

    it("should handle empty strings", () => {
      const { setDate, setTime, setLoveMessage } = useDateStore.getState();

      setDate("" as any);
      setTime("" as any);
      setLoveMessage("");

      const state = useDateStore.getState();
      // Empty strings might be converted to null or kept as is
      expect(state.loveMessage).toBe("");
    });

    it("should handle special characters in love message", () => {
      const { setLoveMessage } = useDateStore.getState();

      setLoveMessage("Test \n\t\r message with <>&\"'");

      const state = useDateStore.getState();
      expect(state.loveMessage).toBe("Test \n\t\r message with <>&\"'");
    });

    it("should handle unicode characters in love message", () => {
      const { setLoveMessage } = useDateStore.getState();

      setLoveMessage("I ❤️ U 💖");

      const state = useDateStore.getState();
      expect(state.loveMessage).toBe("I ❤️ U 💖");
    });
  });

  // ==========================================================================
  // Type Safety Tests
  // ==========================================================================

  describe("Type Safety", () => {
    it("should have all required methods", () => {
      const state = useDateStore.getState();

      // Verify all expected properties exist
      expect(state).toHaveProperty("date");
      expect(state).toHaveProperty("time");
      expect(state).toHaveProperty("movie");
      expect(state).toHaveProperty("isDarkMode");
      expect(state).toHaveProperty("isAudioEnabled");
      expect(state).toHaveProperty("loveMessage");

      expect(state).toHaveProperty("setDate");
      expect(state).toHaveProperty("setTime");
      expect(state).toHaveProperty("setMovie");
      expect(state).toHaveProperty("reset");
      expect(state).toHaveProperty("toggleDarkMode");
      expect(state).toHaveProperty("setDarkMode");
      expect(state).toHaveProperty("toggleAudio");
      expect(state).toHaveProperty("setAudioEnabled");
      expect(state).toHaveProperty("setLoveMessage");

      // Verify types
      expect(typeof state.setDate).toBe("function");
      expect(typeof state.setTime).toBe("function");
      expect(typeof state.setMovie).toBe("function");
      expect(typeof state.reset).toBe("function");
      expect(typeof state.toggleDarkMode).toBe("function");
      expect(typeof state.setDarkMode).toBe("function");
      expect(typeof state.toggleAudio).toBe("function");
      expect(typeof state.setAudioEnabled).toBe("function");
      expect(typeof state.setLoveMessage).toBe("function");
    });
  });
});
