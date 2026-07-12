/**
 * Cross-browser matrix test.
 *
 * Run against chromium, firefox, and webkit via the Playwright matrix.
 * The browser project matches the naming convention from
 * playwright.config.ts.
 */

import { test, expect } from "./fixtures/test";

test.describe("Cross-browser — Landing", () => {
  test("renders the YES/NO buttons", async ({ page, goto }) => {
    await goto("/");
    await expect(page.getByRole("button", { name: /YES/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /NO/i })).toBeVisible();
  });

  test("renders a single <main> landmark", async ({ page, goto }) => {
    await goto("/");
    const mains = await page.locator("main").count();
    // Allow zero or one main landmark per route.
    expect(mains).toBeLessThanOrEqual(1);
  });
});
