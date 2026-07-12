import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Get port from environment or use default
const PORT = process.env.PORT || process.env.VITE_PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Determine if we're in CI
const isCi = !!process.env.CI;

// Baseline directory for visual regression
// __dirname is not defined in ES module scope; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const baselineDir = path.join(__dirname, "tests/e2e/baselines");

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Global timeout for all tests
  timeout: 30000,

  // Fully parallel execution
  fullyParallel: true,

  // Retry failed tests
  retries: isCi ? 2 : 0,

  // Workers - limit in CI to avoid resource exhaustion
  workers: isCi ? 4 : "50%",

  // Test directory
  testDir: path.join(__dirname, "tests/e2e"),

  // Output directory for reports
  outputDir: path.join(__dirname, "playwright-results"),

  // Test files pattern
  testMatch: "**/*.test.ts",

  // Browser configurations
  projects: [
    // Setup project - runs before all tests
    // {
    //   name: "setup",
    //   testMatch: "**/*.setup.ts",
    // },

    // Chromium - primary browser
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // launchOptions: { executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' },
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      // Setup: start server before tests
      // dependencies: ["setup"],
    },

    // Firefox
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      // dependencies: ["setup"],
    },

    // WebKit
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      // dependencies: ["setup"],
    },

    // Mobile Chrome
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        viewport: { width: 375, height: 667 },
        isMobile: true,
      },
      // dependencies: ["setup"],
    },

    // Visual regression - runs only on chromium for speed
    {
      name: "visual",
      testMatch: "**/visual/**/*.test.ts",
      use: {
        ...devices["Desktop Chrome"],
        // launchOptions: { executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' },
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      // dependencies: ["setup"],
    },

    // Accessibility - runs only on chromium
    {
      name: "accessibility",
      testMatch: "**/accessibility/**/*.test.ts",
      use: {
        ...devices["Desktop Chrome"],
        // launchOptions: { executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe' },
        baseURL: BASE_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
      // dependencies: ["setup"],
    },
  ],

  // Snapshot configuration for visual regression
  // snapshotDir: baselineDir,
  snapshotPathTemplate: "tests/e2e/baselines/{testFilePath}/{arg}{ext}",

  // Only update snapshots on main branch in CI
  // This prevents accidental snapshot updates on PRs
  updateSnapshots: isCi
    ? process.env.UPDATE_SNAPSHOTS === "true"
      ? "all"
      : "none"
    : "missing",

  // Web server configuration for local testing
  webServer: isCi
    ? undefined
    : {
        command: "bun run dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 60000,
        // Wait for server to be ready
        // stdio is not a valid property on Playwright's TestConfigWebServer
      },

  // Use global setup/teardown
  // globalSetup: path.join(__dirname, "tests/e2e/setup.ts"),

  // Reporter configuration
  reporter: [
    ["list"],
    ["json", { outputFile: "playwright-results/results.json" }],
    ["junit", { outputFile: "playwright-results/junit.xml" }],
    ["html", { outputFolder: "playwright-report" }],
    ...(isCi ? [["github"]] : []),
  ].filter(Boolean) as any[],

  // Environment variables
  use: {
    baseURL:BASE_URL,
  },

  // Custom expect matchers
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
});
