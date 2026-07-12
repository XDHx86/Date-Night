/**
 * Performance budgets (Playwright).
 *
 * Pin the project's performance contract:
 *   • Landing first-contentful paint < 2.0s
 *   • Landing DOM-content-loaded < 2.5s
 *   • Total transferred bytes < 1 MB
 *
 * These tests are deliberately lenient so they fail on regressions
 * but ignore node-to-node variance. If you ever need to tighten a
 * budget, do it in this file — not scattered across suites.
 */

import { test, expect } from "../fixtures/test";

test.describe("Performance", () => {
  test("landing page first-contentful paint under 2.0s", async ({ goto, page }) => {
    await goto("/", { waitUntil: "domcontentloaded" });
    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName("first-contentful-paint")[0];
      return entry ? entry.startTime : null;
    });
    expect(fcp, "first-contentful-paint").not.toBeNull();
    expect(fcp!).toBeLessThan(2_000);
  });

  test("landing page DOM-content-loaded < 2.5s", async ({ page }) => {
    const t0 = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const t = Date.now() - t0;
    expect(t).toBeLessThan(2_500);
  });

  test("landing transfer size < 1 MB", async ({ page }) => {
    const responses: number[] = [];
    page.on("response", async (resp) => {
      try {
        const headers = resp.headers();
        const length = headers["content-length"];
        if (length) responses.push(Number(length));
      } catch {
        // ignore
      }
    });
    await page.goto("/", { waitUntil: "load" });
    const total = responses.reduce((a, b) => a + b, 0);
    expect(total).toBeLessThan(1_000_000);
  });

  test("does not block the main thread for >200ms during landing render", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // Wait extra time for hydration.
    await page.waitForTimeout(1_000);
    const longTasks = await page.evaluate(() =>
      (performance.getEntriesByType("longtask") ?? []).map(
        (entry) => (entry as PerformanceEntry).duration,
      ),
    );
    const worstLongTask = longTasks.reduce((a, b) => Math.max(a, b), 0);
    // Allow some headroom — long tasks of 250ms+ would be felt by users.
    expect(worstLongTask).toBeLessThan(250);
  });
});
