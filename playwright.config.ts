/**
 * Datenight — Playwright configuration.
 *
 * Design goals:
 *   • Deterministic and CI-friendly runs (linear mode outside developers' boxes).
 *   • Project-based execution so a single asset covers browser-matrix,
 *     responsive, accessibility, visual, performance, smoke, security, and
 *     regression — no test file is silently dropped on the floor.
 *   • Single source of truth for the dev server: Playwright owns it via the
 *     `webServer` block so `bun run test:e2e` works on a clean checkout.
 *   • Reasonable defaults: retries on CI, video + trace on failure,
 *     screenshots on failure, snapshots compared at 2% diff max.
 */

import { defineConfig, devices, type Project } from "@playwright/test";

const PORT = Number(process.env.PORT ?? process.env.VITE_PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const CI = Boolean(process.env.CI);

// ---------------------------------------------------------------------------
// Shared options
// ---------------------------------------------------------------------------
const common: Parameters<typeof defineConfig>[0] = {
  testDir: "tests/e2e",
  testMatch: ["**/*.test.ts"],
  // The dataset of folders that hold E2E tests. Each subdirectory is a
  // "feature area" — Playwright's `projects` (configured below) selects
  // which subset to run by `testMatch`.
  testIgnore: ["**/fixtures/**", "**/baselines/**", "**/test.ts"],
  outputDir: "test-results/",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  fullyParallel: !CI,
  // CI must be deterministic; local devs benefit from concurrency.
  workers: CI ? 1 : undefined,
  retries: CI ? 2 : 0,
  reporter: CI
    ? [
        ["github"],
        ["list"],
        ["junit", { outputFile: "test-results/junit-e2e.xml" }],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    // Prevents flaky test runs caused by service workers leaking between
    // tests in the same browser context.
    serviceWorkers: "block",
  },
  metadata: {
    purpose: "datenight-e2e",
  },
  // Playwright auto-starts the dev server. `npm run dev` is the project's
  // primary script (see package.json). The `reuseExistingServer` flag lets
  // developers run tests against `npm run dev` without re-spawning a process.
  webServer: {
    command: "npm run dev",
    url: `${BASE_URL}/`,
    timeout: 120_000,
    reuseExistingServer: !CI,
    stdout: "pipe",
    stderr: "pipe",
  },
};

// ---------------------------------------------------------------------------
// Helper: stable matrix execution
// ---------------------------------------------------------------------------
const desktopProject = (name: string, testMatch: RegExp | RegExp[]): Project => ({
  name,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  },
  testMatch,
  testIgnore: common.testIgnore,
  timeout: common.timeout,
  retries: common.retries,
});

// ---------------------------------------------------------------------------
// Final config
// ---------------------------------------------------------------------------
export default defineConfig({
  ...common,
  projects: [
    // ----- Smoke: every PR must keep the basics alive -----------------
    {
      name: "setup",
      testMatch: /.*\.smoke\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: [],
    },
    {
      name: "smoke",
      testMatch: /smoke\/.*\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ----- User journeys -----------------------------------------------
    desktopProject("user-journeys-desktop", /user-journeys\/.*\.test\.ts/),

    // ----- Visual regression ------------------------------------------
    {
      name: "visual",
      testMatch: /visual\/.*\.test\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },

    // ----- Accessibility scans ----------------------------------------
    {
      name: "accessibility",
      testMatch: /accessibility\/.*\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ----- Performance regression -------------------------------------
    {
      name: "performance",
      testMatch: /performance\/.*\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ----- Regression / edge case / error boundary --------------------
    desktopProject("regression", /regression\/.*\.test\.ts/),
    desktopProject("error-boundary", /error-boundary\/.*\.test\.ts/),
    desktopProject("security", /security\/.*\.test\.ts/),

    // ----- Cross-browser matrix ---------------------------------------
    {
      name: "chromium",
      testMatch: /.*\.browser\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: /.*\.browser\.test\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: /.*\.browser\.test\.ts/,
      use: { ...devices["Desktop Safari"] },
    },

    // ----- Cross-device / responsive ----------------------------------
    {
      name: "mobile-chrome",
      testMatch: [/.*\.browser\.test\.ts/, /.*\.responsive\.test\.ts/],
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      testMatch: [/.*\.browser\.test\.ts/, /.*\.responsive\.test\.ts/],
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "tablet",
      testMatch: /.*\.responsive\.test\.ts/,
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
});
