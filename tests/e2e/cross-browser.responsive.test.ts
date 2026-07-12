/**
 * Responsive design tests.
 *
 * Run on the `mobile-chrome`, `mobile-safari` and `tablet` Playwright
 * projects (different viewports).
 */

import { test, expect } from "./fixtures/test";

test.describe("Responsive — Landing page", () => {
  test("does not overflow the viewport horizontally", async ({ page, goto }) => {
    await goto("/");
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const viewWidth = window.innerWidth;
      return docWidth - viewWidth;
    });
    expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
  });

  test("tap targets are large enough on mobile viewports", async ({ page, goto }) => {
    await goto("/");
    const yesYes = page.getByRole("button", { name: /YES/i });
    const box = await yesYes.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });
});
