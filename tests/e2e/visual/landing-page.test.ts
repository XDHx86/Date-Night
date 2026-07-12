/**
 * E2E Tests: Visual Regression
 * Tests that capture and compare screenshots.
 * Baselines are stored in tests/e2e/visual/baselines/ and committed to the repo.
 */

import { test, expect } from "../fixtures/test";

test.describe("Visual Regression", () => {
  test("landing page matches snapshot", async ({ page, goto }) => {
    await goto("/");

    // Wait for animations to complete
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot("landing-page.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("date picker matches snapshot", async ({ page, goto }) => {
    await goto("/date");

    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot("date-picker.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("time picker matches snapshot", async ({ page, goto, setLocalStorage }) => {
    // Pre-populate date for time picker access
    await setLocalStorage("date-plan", JSON.stringify({
      state: { date: "2026-07-15", time: null, movie: null },
      version: 0,
    }));

    await goto("/time");
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot("time-picker.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("movie picker matches snapshot", async ({ page, goto, setLocalStorage }) => {
    await setLocalStorage("date-plan", JSON.stringify({
      state: { date: "2026-07-15", time: "19:00", movie: null },
      version: 0,
    }));

    await goto("/movie");
    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot("movie-picker.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
});
