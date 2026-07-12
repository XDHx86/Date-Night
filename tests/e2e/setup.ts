/**
 * Playwright global setup file.
 * This file is run once before all Playwright tests.
 * It's used for setting up the test environment, starting servers, etc.
 */

import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig): Promise<void> {
  // In a real application, you might start a dev server here
  // For Datenight, we'll rely on the built-in webServer configuration
  // in playwright.config.ts which starts the dev server automatically

  // However, we can use this for any global setup needed
  // such as creating test users, seeding databases, etc.

  // For now, we'll just log that setup is running
  console.log("[Playwright Global Setup] Running...");

  // Note: In the current configuration, the webServer is started by Playwright
  // using the `webServer` option in playwright.config.ts
  // This is the recommended approach for Vite/React applications
}

export default globalSetup;
