/**
 * Unit tests for utils.ts.
 * Tests cover the cn() function for class merging.
 */

import { describe, it, expect } from "vitest";
import { cn } from "../../../src/lib/utils";

describe("utils.ts", () => {
  describe("cn() function", () => {
    it("should return empty string for no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should return single class name unchanged", () => {
      const result = cn("button");
      expect(result).toBe("button");
    });

    it("should merge multiple class names", () => {
      const result = cn("button", "primary");
      expect(result).toContain("button");
      expect(result).toContain("primary");
    });

    it("should handle Tailwind class conflicts correctly", () => {
      const result = cn("text-red-500", "text-blue-500");
      // The last class should win due to Tailwind's behavior
      expect(result).toBe("text-blue-500");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("button", isActive && "active");
      expect(result).toContain("button");
      expect(result).toContain("active");
    });

    it("should filter out false values", () => {
      const result = cn("button", false, "primary", undefined, null);
      expect(result).toBe("button primary");
    });

    it("should filter out empty strings", () => {
      const result = cn("button", "", "primary", "");
      expect(result).toBe("button primary");
    });

    it("should handle template literal syntax from clsx", () => {
      const result = cn(`button ${"primary"}`);
      expect(result).toBe("button primary");
    });

    it("should handle objects with truthy values", () => {
      const result = cn({
        button: true,
        primary: true,
        disabled: false,
      });
      expect(result).toContain("button");
      expect(result).toContain("primary");
      expect(result).not.toContain("disabled");
    });

    it("should handle objects with falsy values", () => {
      const result = cn({
        button: true,
        primary: false,
        disabled: 0,
        empty: "",
        nul: null,
        undef: undefined,
      });
      expect(result).toBe("button");
    });

    it("should handle nested objects", () => {
      const result = cn({
        button: true,
        "text-red": true,
      });
      expect(result).toContain("button");
      expect(result).toContain("text-red");
    });

    it("should handle arrays", () => {
      const result = cn(["button", "primary"]);
      expect(result).toContain("button");
      expect(result).toContain("primary");
    });

    it("should handle nested arrays", () => {
      const result = cn(["button", ["primary", "large"]]);
      expect(result).toContain("button");
      expect(result).toContain("primary");
      expect(result).toContain("large");
    });

    it("should handle complex nested structures", () => {
      const result = cn(
        "button",
        {
          primary: true,
          disabled: false,
        },
        ["flex", "items-center"]
      );
      expect(result).toContain("button");
      expect(result).toContain("primary");
      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).not.toContain("disabled");
    });

    it("should merge Tailwind classes from different sources", () => {
      const baseClasses = "px-4 py-2 rounded";
      const variantClasses = "bg-blue-500 text-white";
      const sizeClasses = "text-sm";

      const result = cn(baseClasses, variantClasses, sizeClasses);

      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("rounded");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).toContain("text-sm");
    });

    it("should handle duplicate classes", () => {
      const result = cn("button", "button", "button");
      // Tailwind-merge should deduplicate
      expect(result).toBe("button");
      expect(result).not.toContain("button button");
    });

    it("should handle whitespace in class names", () => {
      const result = cn(" button ", " primary ", " large ");
      // Should trim and deduplicate whitespace
      expect(result).not.toMatch(/\s\s/);
    });

    it("should handle numbers by converting to strings", () => {
      const result = cn(123, 456);
      expect(result).toBe("123 456");
    });

    it("should handle negative numbers", () => {
      const result = cn(-1, -2);
      expect(result).toBe("-1 -2");
    });

    it("should handle zero", () => {
      const result = cn(0);
      // Zero is falsy, so it should be filtered out
      expect(result).toBe("");
    });
  });
});
