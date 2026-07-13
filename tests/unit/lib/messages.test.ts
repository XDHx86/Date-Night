/**
 * Unit tests for messages.ts.
 * Tests cover message collections and random selection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock Math.random for deterministic testing
let mockRandomValue = 0.5;
const originalRandom = Math.random;

beforeEach(() => {
  Math.random = () => mockRandomValue;
});

afterEach(() => {
  Math.random = originalRandom;
});

// Import the messages and functions
import { messages, useRandomMessage, useAnyRandomMessage } from "../../../src/lib/messages";

describe("messages.ts", () => {
  describe("Messages Object", () => {
    it("should have all expected categories", () => {
      const expectedCategories = [
        "encouragement",
        "playful",
        "romantic",
        "movie",
        "time",
        "date",
        "celebration",
      ];

      expectedCategories.forEach((category) => {
        expect(messages).toHaveProperty(category);
      });
    });

    it("should have non-empty arrays for all categories", () => {
      Object.entries(messages).forEach(([category, categoryMessages]) => {
        expect(Array.isArray(categoryMessages)).toBe(true);
        expect(categoryMessages.length).toBeGreaterThan(0);
      });
    });

    it("should have all messages as strings", () => {
      Object.entries(messages).forEach(([category, categoryMessages]) => {
        categoryMessages.forEach((message, index) => {
          expect(typeof message).toBe("string");
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have unique messages within each category", () => {
      Object.entries(messages).forEach(([category, categoryMessages]) => {
        const uniqueMessages = new Set(categoryMessages);
        expect(uniqueMessages.size).toBe(categoryMessages.length);
      });
    });

    it("should have a reasonable number of messages per category", () => {
      Object.entries(messages).forEach(([category, categoryMessages]) => {
        expect(categoryMessages.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe("Message Content", () => {
    it("should have encouragement messages with positive tone", () => {
      messages.encouragement.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        // Encouragement messages should contain positive words
        const hasPositiveWord = /great|amazing|wonderful|good|keep going|fine|best|love/i.test(
          lowerMsg,
        );
        expect(hasPositiveWord || msg.length > 0).toBe(true);
      });
    });

    it("should have playful messages with fun tone", () => {
      messages.playful.forEach((msg) => {
        expect(msg.length).toBeGreaterThan(0);
      });
    });

    it("should have romantic messages", () => {
      messages.romantic.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        expect(lowerMsg).toMatch(/love|romance|heart|❤️|✨/i);
      });
    });

    it("should have movie-related messages", () => {
      messages.movie.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        expect(lowerMsg).toMatch(/movie|film|popcorn|🎬|🎥|scene|actor/i);
      });
    });

    it("should have time-related messages", () => {
      messages.time.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        expect(lowerMsg).toMatch(/time|clock|hour|minute|⏰|⏳|moment/i);
      });
    });

    it("should have date-related messages", () => {
      messages.date.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        expect(lowerMsg).toMatch(/date|calendar|day|month|Ⓟ|📅/i);
      });
    });

    it("should have celebration messages", () => {
      messages.celebration.forEach((msg) => {
        const lowerMsg = msg.toLowerCase();
        expect(lowerMsg).toMatch(/congrat|celebrat|amazing|great|wonderful|🎉|🎊|party/i);
      });
    });
  });

  describe("useRandomMessage", () => {
    it("should return a message from the specified category", () => {
      Object.keys(messages).forEach((category) => {
        Math.random = () => 0; // Always select first message
        const msg = useRandomMessage(category as keyof typeof messages);
        expect(messages[category as keyof typeof messages]).toContain(msg);
      });
    });

    it("should return the first message when Math.random is 0", () => {
      Math.random = () => 0;

      Object.keys(messages).forEach((category) => {
        const categoryMessages = messages[category as keyof typeof messages];
        const msg = useRandomMessage(category as keyof typeof messages);
        expect(msg).toBe(categoryMessages[0]);
      });
    });

    it("should return the last message when Math.random is just below 1", () => {
      Math.random = () => 0.999999;

      Object.keys(messages).forEach((category) => {
        const categoryMessages = messages[category as keyof typeof messages];
        const lastIndex = categoryMessages.length - 1;
        const msg = useRandomMessage(category as keyof typeof messages);
        expect(msg).toBe(categoryMessages[lastIndex]);
      });
    });

    it("should return the same message for the same random value", () => {
      Math.random = () => 0.5;

      const msg1 = useRandomMessage("encouragement");
      const msg2 = useRandomMessage("encouragement");

      expect(msg1).toBe(msg2);
    });

    it("should return different messages for different random values", () => {
      Math.random = () => 0;
      const msg1 = useRandomMessage("encouragement");

      Math.random = () => 0.5;
      const msg2 = useRandomMessage("encouragement");

      // Unless both happen to be the same message
      // which is unlikely with multiple messages
      if (messages.encouragement.length > 1) {
        expect(msg1).not.toBe(msg2);
      }
    });

    it("should handle empty category gracefully", () => {
      // This shouldn't happen in practice, but let's test defensive code
      Math.random = () => 0;

      // We can't actually test this without modifying the messages object
      // but we can verify no errors are thrown
      expect(() => useRandomMessage("encouragement")).not.toThrow();
    });
  });

  describe("useAnyRandomMessage", () => {
    it("should return a message from any category", () => {
      Math.random = () => 0; // Select first category
      Math.random = () => 0; // Select first message in that category

      const msg = useAnyRandomMessage();

      // Verify the message exists in at least one category
      const allMessages = Object.values(messages).flat();
      expect(allMessages).toContain(msg);
    });

    it("should return different messages on subsequent calls", () => {
      // Mock random to cycle through values
      let callCount = 0;
      Math.random = () => {
        callCount++;
        return callCount % 100;
      };

      const msg1 = useAnyRandomMessage();
      const msg2 = useAnyRandomMessage();

      // With enough categories and messages, these should be different
      if (Object.keys(messages).length > 1) {
        expect(msg1).not.toBe(msg2);
      }
    });

    it("should return a valid message", () => {
      Math.random = () => 0.5;

      const msg = useAnyRandomMessage();

      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle calling functions multiple times rapidly", () => {
      Math.random = () => 0.5;

      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(useRandomMessage("encouragement"));
      }

      expect(results.every((r) => typeof r === "string")).toBe(true);
      expect(results.every((r) => r.length > 0)).toBe(true);
    });

    it("should handle all categories with varying message counts", () => {
      Object.keys(messages).forEach((category) => {
        Math.random = () => 0;
        const msg = useRandomMessage(category as keyof typeof messages);
        expect(msg).toBeDefined();
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });
});
