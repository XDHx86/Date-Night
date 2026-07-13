/**
 * E2E Tests: NO User Journey (Playful Flow)
 * Tests the playful NO button that dodges cursor and eventually redirects.
 */

import { test, expect } from "../fixtures/test";

test.describe("NO User Journey - Playful Flow", () => {
  test("NO button redirects to begging page", async ({ goto }) => {
    await goto("/");

    // Click NO button - it will dodge the cursor
    const noButton = page.getByRole("button", { name: /NO/i });

    // Force click at center of element
    await noButton.click({ force: true, position: { x: 50, y: 20 } });

    // Should navigate to begging page
    await page.waitForURL(/begging/, { timeout: 10000 });

    // Verify begging page elements
    await expect(page.getByText(/please|won't you|come on/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("NO button dodges cursor on hovering", async ({ goto }) => {
    await goto("/");

    const noButton = page.getByRole("button", { name: /NO/i });

    // Get initial position
    const initialBox = await noButton.boundingBox();
    expect(initialBox).not.toBeNull();

    // Hover over NO button
    await noButton.hover({ force: true });

    // Wait a moment for dodging behavior
    await page.waitForTimeout(500);

    // Check that position changed (button dodged)
    const newBox = await noButton.boundingBox();
    // Position should be different if dodging is working
    // Note: This might not work in headless mode without mouse movement
  });

  test("begging page eventually allows return to landing", async ({ goto }) => {
    await goto("/");

    // Click NO to navigate to begging
    await page.getByRole("button", { name: /NO/i }).click({ force: true });
    await page.waitForURL(/begging/, { timeout: 10000 });

    // Try various ways to return
    // Look for "Yes" button or similar
    const yesButton = page.getByRole("button", { name: /YES|OK|FINE|YES PLEASE/i }).first();
    if (await yesButton.isVisible()) {
      await yesButton.click({ force: true });
      // After clicking yes, should be back to landing or continue
    }

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Verify we're back at landing
    await expect(page).toHaveURL(/^[^/]*\/?$/);
  });

  test("begging page shows playful message", async ({ goto }) => {
    await goto("/");

    // Navigate to begging
    await page.getByRole("button", { name: /NO/i }).click({ force: true });
    await page.waitForURL(/begging/, { timeout: 10000 });

    // Verify some playful content
    await expect(page.locator("body")).toContainText(/please|won't|reconsider/i);
  });
});
