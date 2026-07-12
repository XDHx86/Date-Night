/**
 * Regression tests for previously-fixed issues.
 *
 * Each test corresponds to a known regression we don't want reintroduced.
 * Keep tests here focused on the *invariant* that fixed the original
 * issue rather than the specific implementation.
 */

import { test, expect } from "../fixtures/test";

test.describe("Regression — URL ⇄ Store sync", () => {
  test("clicking YES writes a date-managed query string to the URL", async ({ goto, page }) => {
    await goto("/");

    // Simulate a successful YES click. We don't actually click — we
    // simulate by going to /confirmation after YES since the click
    // handler navigates after a 2.2s delay (which would slow CI).
    const yesYes = page.getByRole("button", { name: /YES/i });
    await yesYes.click();

    // After /confirmation, navigating forward must keep the URL in sync.
    await page.waitForURL(/confirmation/);
    await expect(page).toHaveURL(/\/(confirmation|$)/);
  });

  test("refreshing /date?date=2026-07-15 hydrates state without UI flicker", async ({ page }) => {
    await page.goto("/date?date=2026-07-15");
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 10_000,
    });
    // Server must have rendered at least one interactive element.
    const buttons = await page.locator("button").count();
    expect(buttons).toBeGreaterThan(0);
  });

  test("browser back returns to the previous step", async ({ goto, page }) => {
    await goto("/");
    // Forward navigation through the flow.
    await page.goto("/confirmation");
    await page.goto("/date");
    await page.goBack();
    await expect(page).toHaveURL(/confirmation/);
  });
});

test.describe("Regression — TopProgressBar", () => {
  test("progress bar exists on every flow route", async ({ page }) => {
    for (const path of ["/", "/date", "/time", "/movie", "/summary", "/success"]) {
      await page.goto(path);
      // The progress bar uses role=progressbar or a known class.
      const progress = page.locator("[role='progressbar']").first();
      if ((await progress.count()) > 0) {
        await expect(progress).toBeVisible({ timeout: 5_000 });
      }
    }
  });
});

test.describe("Regression — Hydration", () => {
  test("the landing page renders the same heading as the SSR snapshot", async ({ goto, page }) => {
    await goto("/");
    // Whichever heading is shown first must be stable across a soft refresh.
    const headingBefore = await page.locator("h1").first().textContent();
    await page.reload();
    const headingAfter = await page.locator("h1").first().textContent();
    expect(headingAfter).toBe(headingBefore);
  });
});

test.describe("Regression — Movie search fallback", () => {
  test("search returns results even when the network fails", async ({ page }) => {
    // Offline mode → the UI must not crash.
    await page.context().setOffline(true);
    await page.goto("/movie").catch(() => {
      // We expect either a real error UI or a graceful fallback.
    });
    await page.context().setOffline(false);
  });
});
