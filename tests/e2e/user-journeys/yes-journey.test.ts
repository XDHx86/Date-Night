/**
 * E2E Tests: YES User Journey (Complete Path)
 * Tests the full YES path from landing to success.
 * This is a critical user journey that's a regression must-cover.
 */

import { test, expect } from "../fixtures/test";

test.describe("YES User Journey - Complete Flow", () => {
  test.beforeEach(async ({ context }) => {
    // Clear all storage before each test
    await context.clearCookies();
  });

  test("user can complete the full YES journey", async ({
    page,
    goto,
  }) => {
    // Step 1: Landing page
    await goto("/");
    await expect(page).toHaveTitle(/Can i book you for a night/i);
    await expect(page.getByRole("heading", { name: /Will you spend the night/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /YES/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /NO/i })).toBeVisible();

    // Step 2: Click YES
    await page.getByRole("button", { name: /YES/i }).click();

    // Should show celebration/reaction
    await expect(page.getByText(/YAAAAAY|HEART|LOVE|YES/i).first()).toBeVisible({ timeout: 5000 });

    // Wait for navigation to confirmation
    await page.waitForURL(/confirmation/, { timeout: 10000 });

    // Step 3: Confirmation page
    await expect(page.getByRole("heading").first()).toBeVisible();

    // Continue to date picker
    const continueButton = page.getByRole("button", { name: /Continue|Book.*night|Plan.*Date/i }).first();
    await continueButton.click();

    // Step 4: Date picker
    await page.waitForURL(/\/date/, { timeout: 10000 });
    await expect(page.getByRole("heading", { level: 1 }).or(page.getByText(/date|when/i).first())).toBeVisible();

    // Select a date
    const dateCell = page.getByRole("button").filter({ hasText: /^\d+$/ }).first();
    await dateCell.click();

    // Continue
    const nextButton = page.getByRole("button", { name: /Continue|Next/i }).last();
    await nextButton.click();

    // Step 5: Time picker
    await page.waitForURL(/\/time/, { timeout: 10000 });

    // Select a time
    const timeButton = page.getByRole("button").filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeButton.click();

    // Continue
    const timeNextButton = page.getByRole("button", { name: /Continue|Next/i }).last();
    await timeNextButton.click();

    // Step 6: Movie picker
    await page.waitForURL(/\/movie/, { timeout: 10000 });

    // Search for a movie
    const searchInput = page.getByPlaceholder(/Search movies/i);
    await searchInput.fill("Scary");

    // Wait for results
    await page.waitForTimeout(500);

    // Select a movie
    const movieCard = page.getByRole("button", { name: /Scary/i }).first();
    if (await movieCard.isVisible()) {
      await movieCard.click();
    }

    // Continue
    const movieNextButton = page.getByRole("button", { name: /Continue|Next/i }).last();
    await movieNextButton.click();

    // Step 7: Summary
    await page.waitForURL(/\/summary/, { timeout: 10000 });

    // Verify summary shows selections
    await expect(page.getByText(/Date|Time|Movie/i).first()).toBeVisible();

    // Confirm
    const confirmButton = page.getByRole("button", { name: /Confirm|Let's go|Yes/i }).first();
    await confirmButton.click();

    // Step 8: Success
    await page.waitForURL(/\/success/, { timeout: 10000 });
    await expect(page.getByText(/Success|Perfect|Woo|Go/i).first()).toBeVisible();
  });

  test("user journey with URL state restoration", async ({
    page,
    goto,
    setLocalStorage,
  }) => {
    // Pre-populate store with a date selection
    await setLocalStorage("date-plan", JSON.stringify({
      state: {
        date: "2026-07-15",
        time: "19:00",
        movie: {
          id: "614945",
          title: "Voicemails for Isabelle",
          description: "Test description",
          poster_path: "/test.jpg",
          rating: 8.2,
          tags: ["Romance"],
          year: 2026,
          duration: 98,
        },
      },
      version: 0,
    }));

    // Navigate directly to summary
    await goto("/summary");

    // URL should reflect the state
    await expect(page).toHaveURL(/date=2026-07-15/);

    // Summary should display the restored state
    await expect(page.getByText(/Voicemails for Isabelle/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("user journey handles back navigation", async ({
    page,
    goto,
  }) => {
    // Start at landing
    await goto("/");

    // Navigate forward through flow
    await page.getByRole("button", { name: /YES/i }).click();
    await page.waitForURL(/confirmation/, { timeout: 10000 });

    // Use browser back
    await page.goBack();
    await expect(page).toHaveURL(/^[^/]*\/?$/);
  });
});
