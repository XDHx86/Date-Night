/**
 * Playwright base test fixture.
 * This file extends the default Playwright test fixture with
 * custom setup, teardown, and utilities for the Datenight application.
 */

import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
  type Locator,
} from "@playwright/test";

// ============================================================================
// Custom Fixture Types
// ============================================================================

/**
 * Custom test options for Datenight tests.
 */
export interface DatenightTestOptions {
  /**
   * Whether to start at the landing page.
   * @default true
   */
  startAtLanding?: boolean;

  /**
   * Whether to enable MSW mocking.
   * @default true
   */
  withMsw?: boolean;

  /**
   * Whether to clear localStorage before the test.
   * @default true
   */
  clearStorage?: boolean;

  /**
   * Viewport size for the test.
   */
  viewport?: { width: number; height: number };

  /**
   * User agent for the test.
   */
  userAgent?: string;
}

/**
 * Extended test context with custom fixtures.
 */
export interface DatenightFixtures {
  /**
   * The landing page (loaded automatically if startAtLanding is true).
   */
  landingPage: Page;

  /**
   * Helper to navigate to a specific route.
   */
  goto: (
    path: string,
    options?: { waitUntil?: "domcontentloaded" | "load" | "networkidle" },
  ) => Promise<void>;

  /**
   * Helper to wait for navigation to complete.
   */
  waitForNavigation: (path?: string) => Promise<void>;

  /**
   * Helper to clear all storage.
   */
  clearAllStorage: () => Promise<void>;

  /**
   * Helper to set localStorage value.
   */
  setLocalStorage: (key: string, value: string) => Promise<void>;

  /**
   * Helper to get localStorage value.
   */
  getLocalStorage: (key: string) => Promise<string | null>;

  /**
   * Helper to wait for URL to contain a specific path.
   */
  waitForUrl: (path: string | RegExp) => Promise<void>;

  /**
   * Helper to click an element and wait for navigation.
   */
  clickAndNavigate: (selector: string | Locator, path?: string) => Promise<void>;

  /**
   * Helper to select a date from the calendar.
   */
  selectDate: (date: string) => Promise<void>;

  /**
   * Helper to select a time.
   */
  selectTime: (time: string) => Promise<void>;

  /**
   * Helper to search for a movie.
   */
  searchMovie: (query: string) => Promise<void>;

  /**
   * Helper to select a movie from results.
   */
  selectMovie: (movieTitle: string | RegExp) => Promise<void>;

  /**
   * Helper to complete the YES journey (full flow).
   */
  completeYesJourney: (options?: { date?: string; time?: string; movie?: string }) => Promise<void>;

  /**
   * Helper to complete the NO journey (playful flow).
   */
  completeNoJourney: () => Promise<void>;
}

// ============================================================================
// Custom Assertions
// ============================================================================

/**
 * Extended expect with custom matchers.
 * Currently just re-exports the base expect.
 * Can be extended with custom matchers as needed.
 */
export { expect } from "@playwright/test";

// ============================================================================
// Custom Expect Extensions
// ============================================================================

// These type declarations allow us to extend the expect API
declare module "@playwright/test" {
  interface Expect {
    // Custom expect matchers can be added here
    // Example: toBeSelected(): Promise<void>;
  }

  interface Matchers {
    // Custom matchers can be added here
    // Example: toBeSelected(): Promise<void>;
  }

  interface ElementHandle {
    // Custom element methods can be added here
  }

  interface Page {
    // Custom page methods can be added here
  }
}

// ============================================================================
// Test Fixture Factory
// ============================================================================

/**
 * Create a custom test fixture with configured options.
 * This factory function allows tests to specify their requirements
 * and get a test context tailored to their needs.
 */
export function createDatenightTest(options: DatenightTestOptions = {}) {
  const { startAtLanding = true, clearStorage = true, viewport, userAgent } = options;

  return base.extend<DatenightFixtures>({
    // Set viewport
    viewport: viewport ?? { width: 1280, height: 800 },

    // Set user agent
    // Note: userAgent is set through browser context in the actual fixture

    // Landing page fixture
    landingPage: async ({ page, context }, use) => {
      // Clear storage if requested
      if (clearStorage) {
        await context.clearCookies();
        await context.clearPermissions();
        await page.evaluate(() => {
          window.localStorage.clear();
          window.sessionStorage.clear();
        });
      }

      // Navigate to landing page if requested
      if (startAtLanding) {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        // Wait for the main content to be visible
        await page.waitForSelector("main", { state: "visible" }).catch(() => {
          // Some pages might not have a main element
        });
      }

      await use(page);
    },

    // Navigation helper
    goto: async ({ page }, use) => {
      const goto = async (
        path: string,
        options?: { waitUntil?: "domcontentloaded" | "load" | "networkidle" },
      ) => {
        await page.goto(path, {
          waitUntil: options?.waitUntil ?? "domcontentloaded",
        });
        // Wait for any client-side rendering to complete
        await page.waitForLoadState("networkidle");
      };
      await use(goto);
    },

    // Wait for navigation helper
    waitForNavigation: async ({ page }, use) => {
      const waitForNavigation = async (path?: string) => {
        if (path) {
          await page.waitForURL(`**${path}`);
        } else {
          // Wait for navigation to complete (any URL change)
          await page.waitForEvent("framenavigated");
        }
      };
      await use(waitForNavigation);
    },

    // Clear all storage helper
    clearAllStorage: async ({ context, page }, use) => {
      const clearAllStorage = async () => {
        await context.clearCookies();
        await page.evaluate(() => {
          window.localStorage.clear();
          window.sessionStorage.clear();
        });
      };
      await use(clearAllStorage);
    },

    // LocalStorage helpers
    setLocalStorage: async ({ page }, use) => {
      const setLocalStorage = async (key: string, value: string) => {
        await page.evaluate(
          (k, v) => {
            window.localStorage.setItem(k, v);
          },
          key,
          value,
        );
      };
      await use(setLocalStorage);
    },

    getLocalStorage: async ({ page }, use) => {
      const getLocalStorage = async (key: string): Promise<string | null> => {
        return await page.evaluate((k) => window.localStorage.getItem(k), key);
      };
      await use(getLocalStorage);
    },

    // URL helper
    waitForUrl: async ({ page }, use) => {
      const waitForUrl = async (path: string | RegExp) => {
        if (typeof path === "string") {
          await page.waitForURL(`**${path}`);
        } else {
          await page.waitForURL(path);
        }
      };
      await use(waitForUrl);
    },

    // Click and navigate helper
    clickAndNavigate: async ({ page }, use) => {
      const clickAndNavigate = async (selector: string | Locator, path?: string) => {
        const locator = typeof selector === "string" ? page.locator(selector) : selector;
        await locator.click();
        if (path) {
          await page.waitForURL(`**${path}`);
        }
      };
      await use(clickAndNavigate);
    },

    // Select date helper
    selectDate: async ({ page }, use) => {
      const selectDate = async (date: string) => {
        // Format: YYYY-MM-DD
        // The date picker uses a calendar component
        // We need to find and click the specific date
        const day = new Date(date).getDate();
        await page.getByRole("button", { name: String(day) }).first.click();
      };
      await use(selectDate);
    },

    // Select time helper
    selectTime: async ({ page }, use) => {
      const selectTime = async (time: string) => {
        // Format: HH:mm
        // Find the time button and click it
        await page.getByRole("button", { name: time }).click();
      };
      await use(selectTime);
    },

    // Search movie helper
    searchMovie: async ({ page }, use) => {
      const searchMovie = async (query: string) => {
        const searchInput =
          page.getByPlaceholder(/Search movies/i) ||
          page.getByLabel(/Search movies/i) ||
          page.locator("input[type='search']");
        await searchInput.fill(query);
        // Wait for results to appear
        await page.waitForSelector("[role='option']", { state: "visible" }).catch(() => {
          // No results expected
        });
      };
      await use(searchMovie);
    },

    // Select movie helper
    selectMovie: async ({ page }, use) => {
      const selectMovie = async (movieTitle: string | RegExp) => {
        const pattern = typeof movieTitle === "string" ? new RegExp(movieTitle, "i") : movieTitle;
        await page.getByRole("button", { name: pattern }).first.click();
      };
      await use(selectMovie);
    },

    // Complete YES journey helper
    completeYesJourney: async (
      { page, goto, selectDate, selectTime, searchMovie, selectMovie },
      use,
    ) => {
      const completeYesJourney = async (
        options: {
          date?: string;
          time?: string;
          movie?: string;
        } = {},
      ) => {
        const { date = "2026-07-15", time = "19:00", movie = "Scary Movie 6" } = options;

        // Start at landing page
        await goto("/");

        // Click YES button
        await page.getByRole("button", { name: /YES/i }).click();
        await page.waitForURL("**/confirmation");

        // Navigate to date picker (if confirmation has a continue button)
        // The flow is: Landing -> Confirmation -> Date -> Time -> Movie
        await page.waitForTimeout(500); // Small delay for animation

        // Continue to date picker
        const continueButton = page.getByRole("button", { name: /Continue/i, exact: false });
        const count = await continueButton.count();
        if (count > 0) {
          await continueButton.click();
          await page.waitForURL("**/date");
        } else {
          // Try to go directly to date
          await goto("/date");
        }

        // Select date
        await selectDate(date);

        // Continue to time picker
        await page.getByRole("button", { name: /Continue/i }).click();
        await page.waitForURL("**/time");

        // Select time
        await selectTime(time);

        // Continue to movie picker
        await page.getByRole("button", { name: /Continue/i }).click();
        await page.waitForURL("**/movie");

        // Search for movie
        await searchMovie(movie);

        // Select the movie
        await selectMovie(movie);

        // Continue to summary
        await page.waitForTimeout(500); // Small delay
        const continueToSummary = page.getByRole("button", { name: /Continue.*/i });
        if ((await continueToSummary.count()) > 0) {
          await continueToSummary.click();
        }

        await page.waitForURL("**/summary");

        // Confirm to reach success page
        await page.getByRole("button", { name: /Confirm.*/i }).click();
        await page.waitForURL("**/success");
      };
      await use(completeYesJourney);
    },

    // Complete NO journey helper
    completeNoJourney: async ({ page, goto }, use) => {
      const completeNoJourney = async () => {
        // Start at landing page
        await goto("/");

        // Click NO button - it will dodge the cursor
        // We need to force the click at the element's center
        const noButton = page.getByRole("button", { name: /NO/i });
        await noButton.click({ force: true, position: { x: 10, y: 10 } });

        // Wait for the begging page
        await page.waitForURL("**/begging");

        // Try clicking NO again - after a few clicks the button should let us through
        // or redirect back to landing
        await noButton.click({ force: true });

        // Either we're back at landing or we need to click more
        try {
          await page.waitForURL("/", { timeout: 2000 });
        } catch {
          // Click again if still on begging page
          await noButton.click({ force: true });
          await page.waitForURL("/", { timeout: 2000 });
        }
      };
      await use(completeNoJourney);
    },
  });
}

// ============================================================================
// Default Test Export
// ============================================================================

/**
 * Default test fixture with all helpers.
 * This is the main export that most tests should use.
 */
export const test = createDatenightTest();

/**
 * Test fixture starting at landing page.
 */
export const testAtLanding = createDatenightTest({ startAtLanding: true });

/**
 * Test fixture without automatic navigation.
 */
export const testNoNav = createDatenightTest({ startAtLanding: false });

/**
 * Test fixture without storage clearing.
 */
export const testWithStorage = createDatenightTest({ clearStorage: false });

/**
 * Test fixture for mobile viewport.
 */
export const testMobile = createDatenightTest({
  viewport: { width: 375, height: 667 },
});

/**
 * Test fixture for tablet viewport.
 */
export const testTablet = createDatenightTest({
  viewport: { width: 768, height: 1024 },
});

/**
 * Test fixture for desktop viewport (default).
 */
export const testDesktop = createDatenightTest({
  viewport: { width: 1280, height: 800 },
});

// ============================================================================
// Re-exports
// ============================================================================

export { test as base } from "@playwright/test";
