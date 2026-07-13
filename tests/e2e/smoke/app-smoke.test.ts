/**
 * E2E smoke tests for the running app.
 *
 * Run against `vite dev` (or `vite preview` against the built `dist/`)
 * after the SPA shell is up. The suite is split into the `smoke`
 * Playwright project (configured in `playwright.config.ts`).
 *
 * Pure SPA testing approach:
 *   • Each route renders correctly under TanStack Router (no SSR).
 *   • The static sitemap is served at `/sitemap.xml`.
 *   • No console errors on first render.
 *
 * Routes no longer return distinct HTTP status codes — every path in
 * `dist/` returns 200 for a static file or 404 → fallback to `404.html`
 * for a deep link. We exercise the SPA paths via `page.goto()` and
 * assert the route's content renders correctly.
 */

import { test, expect } from "../fixtures/test";

test.describe("Smoke — Critical paths render", () => {
  test("landing page returns HTML with the right title", async ({ goto, page }) => {
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

  test("every primary route renders without routing errors", async ({ page, goto }) => {
    // Deep-link to each route and assert that a heading or content
    // unique to the route becomes visible. The SPA reads
    // `window.location.pathname` and mounts the matching component.
    const routes = [
      { path: "/", heading: /Will you spend the night/i },
      { path: "/date", heading: /Pick our date/i },
      { path: "/time", heading: /Pick a time/i },
      { path: "/love-letter", heading: /Love Letter/i },
      { path: "/confirmation", heading: /YOU SAID YES/i },
      { path: "/begging", heading: /Wait, noo/i },
    ];

    for (const route of routes) {
      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
      });
      // `/404`-fallback routes may return a non-2xx status code while
      // the SPA shell still mounts once the script runs. We tolerate
      // any HTTP status here and assert only on rendered content.
      expect(response, `response for ${route.path}`).not.toBeNull();

      await expect(
        page.getByRole("heading", { level: 1 }).filter({ hasText: route.heading }).first(),
      ).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test("sitemap endpoint serves XML", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
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
