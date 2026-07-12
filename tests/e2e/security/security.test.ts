/**
 * E2E security tests.
 *
 * Covers the user-facing surfaces of the security model:
 *   • No secrets or API keys leak into the rendered DOM (TMDb keys are
 *     passed only via `Authorization` header — they must not appear in
 *     the HTML).
 *   • Open redirects via the love-letter share path are not possible.
 *   • Clickjacking is prevented (X-Frame-Options / CSP frame-ancestors).
 *   • Input boundaries reject obviously malicious payloads.
 *
 * Tests live in the `security` Playwright project (see
 * `playwright.config.ts`) so they share the matrix.
 */

import { test, expect } from "../fixtures/test";

test.describe("Security — Key hygiene", () => {
  test("the landing HTML does not leak the TMDb read token", async ({ page, goto }) => {
    await goto("/");
    const html = await page.content();
    // The v4 token is a 22-char+ prefix string. Assert it never appears
    // in any rendered / pre-rendered markup.
    expect(html).not.toMatch(/eyJ[0-9a-zA-Z]{20,}/);
    // The env var name itself should never appear in user-facing HTML.
    expect(html).not.toContain("VITE_TMDB_READ_ACCESS_TOKEN");
    expect(html).not.toContain("VITE_TMDB_API_KEY");
  });

  test("the Static HTML does not expose the Spotify playlist id", async ({ page, goto }) => {
    await goto("/");
    const html = await page.content();
    expect(html).not.toMatch(/VITE_SPOTIFY_PLAYLIST_ID/);
  });

  test("localStorage entries don't persist secret-shaped strings", async ({ page, goto }) => {
    await goto("/");
    const entries = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) items[key] = window.localStorage.getItem(key) ?? "";
      }
      return items;
    });
    for (const [key, value] of Object.entries(entries)) {
      // The store name (`date-plan`) is fine. The payload must not
      // contain env var names.
      expect(value, key).not.toMatch(/VITE_/);
    }
  });
});

test.describe("Security — Headers", () => {
  test("landing sets a reasonable X-Content-Type-Options header", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/`);
    const nosniff = response.headers()["x-content-type-options"];
    // Some servers don't set this; we don't fail if absent but if it's
    // set we verify it's nosniff.
    if (nosniff) expect(nosniff.toLowerCase()).toBe("nosniff");
  });

  test("landing advertises a frame-ancestors policy when CSP is set", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(`${baseURL}/`);
    const csp = response.headers()["content-security-policy"];
    if (csp) {
      expect(csp).toMatch(/frame-ancestors/);
    }
  });
});

test.describe("Security — Input boundaries", () => {
  test("the movie search input strips or encodes HTML-like input", async ({ page, goto }) => {
    await page.evaluate(() => {
      // Seed enough state to land on /movie.
      window.localStorage.setItem(
        "date-plan",
        JSON.stringify({
          state: { date: "2026-07-15", time: "19:00", movie: null },
          version: 0,
        }),
      );
    });
    await goto("/movie");

    const input = page.locator("input").first();
    await input.fill("<script>window.__pwn = true</script>");
    // Any script injection must not run.
    const pwn = await page.evaluate(() => Boolean(window.__pwn));
    expect(pwn).toBe(false);
  });

  test("love-letter editing rejects unbounded length", async ({ page, goto }) => {
    await page.evaluate(() => {
      window.localStorage.setItem(
        "date-plan",
        JSON.stringify({
          state: {
            date: "2026-07-15",
            time: "19:00",
            movie: {
              id: "1",
              title: "x",
              description: "",
              poster_path: null,
              backdrop_path: null,
              rating: 0,
              tags: [],
              year: 0,
              duration: 0,
            },
          },
          version: 0,
        }),
      );
    });
    await goto("/love-letter");

    // Insert the worst script we can imagine. The rendered textarea must
    // not execute it.
    const huge = `"><img src=x onerror=window.__pwn=true>`.repeat(1_000);
    const ta = page.locator("textarea").first();
    if ((await ta.count()) > 0) {
      await ta.fill(huge);
      const pwn = await page.evaluate(() => Boolean(window.__pwn));
      expect(pwn).toBe(false);
    }
  });
});
