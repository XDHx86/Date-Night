/**
 * E2E smoke tests for the running app.
 *
 * Run after the dev server is up. The suite is split into the
 * `smoke` Playwright project (configured in `playwright.config.ts`).
 */

import { test, expect } from "../fixtures/test";

test.describe("Smoke — Critical paths respond", () => {
  test("landing page returns HTML", async ({ goto, page }) => {
    const response = await page.goto("/", {
      waitUntil: "domcontentloaded",
    });
    expect(response, "navigation response").not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Can i book you for a night/i);
  });

  test("landing page is rendered, not a blank shell", async ({ page, goto }) => {
    await goto("/");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("every primary route returns a successful response", async ({ page }) => {
    for (const path of [
      "/",
      "/date",
      "/time",
      "/movie",
      "/love-letter",
      "/summary",
      "/success",
      "/confirmation",
      "/begging",
    ]) {
      const response = await page.goto(path, {
        waitUntil: "domcontentloaded",
      });
      // The dev server returns 200 for any registered route; 404 is a
      // regression that must fail the smoke run.
      expect(response, `response for ${path}`).not.toBeNull();
      expect(response!.status(), `status for ${path}`).toBeLessThan(400);
    }
  });

  test("sitemap endpoint serves XML", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("datenight");
  });

  test("no JavaScript errors logged on landing render", async ({ goto, page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await goto("/");

    // Allow some time for hydration errors to surface.
    await page.waitForTimeout(2_000);

    const realErrors = errors.filter(
      (e) => !/\[MSW\]|Failed to load resource: net::ERR_FAILED/.test(e) && !/404/.test(e),
    );
    expect(realErrors).toEqual([]);
  });
});
