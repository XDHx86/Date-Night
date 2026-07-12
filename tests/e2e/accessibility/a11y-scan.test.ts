/**
 * E2E Tests: Accessibility (a11y)
 * Uses axe-core via Playwright for accessibility testing.
 */

import { test, expect } from "../fixtures/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("landing page has no accessibility violations", async ({ page, goto }) => {
    await goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("date picker is accessible", async ({ page, goto }) => {
    await goto("/date");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"],
        },
      })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("movie picker is accessible", async ({ page, goto, setLocalStorage }) => {
    // Set date in storage so we can access movie picker
    await setLocalStorage("date-plan", JSON.stringify({
      state: { date: "2026-07-15", time: null, movie: null },
      version: 0,
    }));

    await goto("/movie");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"],
        },
      })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("all interactive elements are keyboard accessible", async ({ page, goto }) => {
    await goto("/");

    // Tab through the page
    await page.keyboard.press("Tab");

    // Check that focus moves through interactive elements
    let focusedCount = 0;
    for (let i = 0; i < 20; i++) {
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused && ["A", "BUTTON", "INPUT", "SELECT"].includes(focused)) {
        focusedCount++;
      }
      await page.keyboard.press("Tab");
    }

    // Should have several focusable elements
    expect(focusedCount).toBeGreaterThan(2);
  });

  test("images have alt text", async ({ page, goto }) => {
    await goto("/");

    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeDefined();
      // Alt can be empty for decorative images, but should not contain "undefined"
      if (alt) {
        expect(alt).not.toBe("undefined");
      }
    }
  });

  test("forms have proper labels", async ({ page, goto }) => {
    await goto("/movie");

    const searchInput = await page.getByPlaceholder(/Search movies/i);

    // Check for accessible label
    const ariaLabel = await searchInput.getAttribute("aria-label");
    const labelText = await searchInput.getAttribute("aria-labelledby");
    expect(ariaLabel || labelText).toBeTruthy();
  });

  test("page has proper heading hierarchy", async ({ page, goto }) => {
    await goto("/");

    // Check for h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
