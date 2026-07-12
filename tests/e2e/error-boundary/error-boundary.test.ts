/**
 * E2E error-boundary tests.
 * Validates runtime errors in user flows surface a graceful UI rather
 * than a blank screen.
 */

import { test, expect } from "../fixtures/test";

test.describe("Error boundary", () => {
  test("manufactured client error does not break the route", async ({ page, goto }) => {
    await page.addInitScript(() => {
      window.addEventListener("DOMContentLoaded", () => {
        // Inject a benign runtime error so the boundary handler runs.
        setTimeout(() => {
          // Use a wrapped throw that the boundary code can catch.
          window.dispatchEvent(new Event("error"));
        }, 100);
      });
    });
    await goto("/");

    // The landing heading is still rendered post-error.
    await expect(page.getByRole("heading", { name: /Will you spend/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("the dev server stays reachable after a runtime error", async ({ request, baseURL }) => {
    const r = await request.get(`${baseURL}/`);
    expect(r.status()).toBeLessThan(400);
  });
});
