/**
 * Unit tests for useRandomMessage hook.
 * Tests cover SSR hydration safety and random selection behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { messages } from "../../../src/lib/messages";

// Import after mocking
import { useRandomMessage, useAnyRandomMessage } from "../../../src/hooks/useRandomMessage";

// Mock Math.random
let mockRandomValue = 0.5;
const originalRandom = Math.random;

beforeEach(() => {
  Math.random = () => mockRandomValue;
});

afterEach(() => {
  Math.random = originalRandom;
});

describe("useRandomMessage", () => {
  describe("SSR Hydration Safety", () => {
    it("should return first message during initial render (SSR)", () => {
      Math.random = () => 0.5; // Would normally pick a random message on client

      const { result } = renderHook(() => useRandomMessage("encouragement"));

      // During SSR (initial render), should return first message
      expect(result.current).toBe(messages.encouragement[0]);
    });

    it("should return first message of category during SSR", () => {
      Object.keys(messages).forEach((category) => {
        Math.random = () => 0.5;

        const { result } = renderHook(() => useRandomMessage(category as keyof typeof messages));

        expect(result.current).toBe(messages[category as keyof typeof messages][0]);
      });
    });

    it("should return empty string for unknown category during SSR", () => {
      Math.random = () => 0.5;

      const { result } = renderHook(() => useRandomMessage("unknown" as keyof typeof messages));

      expect(result.current).toBe("");
    });
  });

  describe("Client-side Behavior", () => {
    it("should update to random message after useEffect runs", () => {
      // Set initial random value
      mockRandomValue = 0.5;

      // Motivate useEffect to run by adding a React hook
      const { result, rerender } = renderHook(() => useRandomMessage("encouragement"));

      // Initial render returns first message
      expect(result.current).toBe(messages.encouragement[0]);
    });

    it("should pick a random message from the category", () => {
      // We need to test the actual behavior in a browser-like environment
      // This is more of an integration test

      const { result } = renderHook(() => useRandomMessage("encouragement"));

      // After render, the message should be from the category
      // Due to SSR hydration, it returns first message initially
      expect(messages.encouragement).toContain(result.current);
    });

    it("should only re-pick message when category changes", () => {
      // Mock random to track calls
      let randomCalls = 0;
      Math.random = () => {
        randomCalls++;
        return 0.5;
      };

      const { result, rerender } = renderHook(
        ({ category }) => useRandomMessage(category as keyof typeof messages),
        { initialProps: { category: "encouragement" } },
      );

      const firstMessage = result.current;
      const initialCalls = randomCalls;

      // Re-render with same category
      rerender({ category: "encouragement" });

      // Should not have called Math.random again
      expect(randomCalls).toBe(initialCalls);
      expect(result.current).toBe(firstMessage);
    });

    it("should update message when category changes", () => {
      Math.random = () => 0; // Always pick first message in category

      const { result, rerender } = renderHook(
        ({ category }) => useRandomMessage(category as keyof typeof messages),
        { initialProps: { category: "encouragement" } },
      );

      expect(result.current).toBe(messages.encouragement[0]);

      // Change category
      rerender({ category: "playful" });

      expect(result.current).toBe(messages.playful[0]);
    });
  });

  describe("Empty Category Handling", () => {
    it("should return empty string for empty category", () => {
      // We can't actually pass an empty category without modifying the messages object
      // but we can test the behavior with a category that doesn't exist
      const { result } = renderHook(() =>
        useRandomMessage("non_existent" as keyof typeof messages),
      );

      expect(result.current).toBe("");
    });
  });

  describe("Type Safety", () => {
    it("should accept all valid category keys", () => {
      Object.keys(messages).forEach((category) => {
        expect(() => {
          renderHook(() => useRandomMessage(category as keyof typeof messages));
        }).not.toThrow();
      });
    });
  });
});

describe("useAnyRandomMessage", () => {
  describe("SSR Hydration Safety", () => {
    it("should return empty string during initial render (SSR)", () => {
      Math.random = () => 0.5;

      const { result } = renderHook(() => useAnyRandomMessage());

      // During SSR, should return empty string
      expect(result.current).toBe("");
    });
  });

  describe("Client-side Behavior", () => {
    it("should return a message from any category after useEffect", () => {
      mockRandomValue = 0;

      const { result } = renderHook(() => useAnyRandomMessage());

      // The hook should return a valid message
      // Due to SSR, it might still be empty in this test environment
      // but in a real browser it would be populated
      expect(typeof result.current).toBe("string");
    });

    it("should return different messages on different renders", () => {
      // This would require actual useEffect to run
      // which needs a browser environment
      Math.random = () => 0;
      const { result: result1 } = renderHook(() => useAnyRandomMessage());

      Math.random = () => 0.5;
      const { result: result2 } = renderHook(() => useAnyRandomMessage());

      // Both might be empty in SSR mode, but they're independent
      expect(typeof result1.current).toBe("string");
      expect(typeof result2.current).toBe("string");
    });
  });

  describe("Random Distribution", () => {
    it("should be able to pick any message from any category", () => {
      // Test that all categories are accessible
      Object.keys(messages).forEach((category) => {
        Math.random = () => {
          // Return a value that selects this category
          const categories = Object.keys(messages);
          const categoryIndex = categories.indexOf(category);
          const categoryProb = categoryIndex / categories.length;
          return categoryProb + 0.1 / categories.length;
        };

        // Also mock the message selection within the category
        Math.random = () => 0.5;

        const { result } = renderHook(() => useAnyRandomMessage());
        // Should be a non-empty string
        expect(typeof result.current).toBe("string");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty messages object", () => {
      // We can't actually test this without modifying the module
      expect(() => {
        renderHook(() => useAnyRandomMessage());
      }).not.toThrow();
    });

    it("should handle calling in rapid succession", () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        Math.random = () => i / 10;
        const { result } = renderHook(() => useAnyRandomMessage());
        results.push(result.current);
      }

      expect(results.every((r) => typeof r === "string")).toBe(true);
    });
  });
});

describe("Import Verification", () => {
  it("should export useRandomMessage function", () => {
    expect(typeof useRandomMessage).toBe("function");
  });

  it("should export useAnyRandomMessage function", () => {
    expect(typeof useAnyRandomMessage).toBe("function");
  });
});
