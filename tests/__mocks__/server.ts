/**
 * MSW (Mock Service Worker) Server Setup for Vitest.
 * This file sets up MSW to intercept HTTP requests during tests,
 * allowing deterministic testing without requiring real API calls.
 */

import { setupWorker, type SetupWorkerApi } from "msw";
import { defaultHandlers, createMswServer, createFailingMswServer } from "./handlers";

// ============================================================================
// Global MSW Setup
// ============================================================================

// Store the MSW worker instance for cleanup
declare global {
  namespace NodeJS {
    interface Global {
      __mswServer__?: SetupWorkerApi;
      __mswEnabled__: boolean;
    }
  }
}

// Ensure global object exists
const globalAny = globalThis as unknown as NodeJS.Global;

// Track if MSW is currently enabled
const mswEnabled = globalAny.__mswEnabled__ !== false;

// ============================================================================
// Server Setup Function
// ============================================================================

/**
 * Start the MSW server with default handlers.
 * Call this in test setup files or beforeAll hooks.
 */
export function startMswServer(handlers = defaultHandlers) {
  // Skip if already started or if MSW is disabled
  if (globalAny.__mswServer__ || !mswEnabled) {
    return;
  }

  // Create and start the MSW worker
  const server = setupWorker(...handlers);

  globalAny.__mswServer__ = server;
  globalAny.__mswEnabled__ = true;

  // Start the server
  server.start({
    onUnhandledRequest: "bypass",
    // quiet: true, // Uncomment to suppress MSW logs
  });

  // Log that MSW is active (useful for debugging)
  console.debug("[MSW] Mock server started");

  return server;
}

/**
 * Stop the MSW server.
 * Call this in test teardown files or afterAll hooks.
 */
export function stopMswServer() {
  const server = globalAny.__mswServer__;

  if (!server) {
    return;
  }

  // Stop and reset the server
  server.stop();
  server.resetHandlers();

  globalAny.__mswServer__ = undefined;

  console.debug("[MSW] Mock server stopped");
}

/**
 * Reset all MSW handlers to their default state.
 * Call this between tests to ensure clean state.
 */
export function resetMswHandlers() {
  const server = globalAny.__mswServer__;

  if (server) {
    server.resetHandlers(...defaultHandlers);
  }
}

/**
 * Add additional handlers to the MSW server.
 * Use this to customize responses for specific tests.
 */
export function addMswHandlers(...handlers: Parameters<typeof setupWorker>[0]) {
  const server = globalAny.__mswServer__;

  if (server) {
    server.use(...handlers);
  }
}

/**
 * Use failing handlers for error testing.
 * Call this to simulate API failures.
 */
export function useFailingHandlers() {
  const server = globalAny.__mswServer__;

  if (server) {
    server.resetHandlers();
    server.use(...createFailingMswServer().handlers);
  }
}

/**
 * Use default handlers.
 * Call this to restore normal mock responses.
 */
export function useDefaultHandlers() {
  const server = globalAny.__mswServer__;

  if (server) {
    server.resetHandlers(...defaultHandlers);
  }
}

// ============================================================================
// Automatic Setup for Vitest
// ============================================================================

// Start MSW automatically when this file is imported in a test
// Use startMswServer() and stopMswServer() in your setup/teardown
// instead of Auto-start to have more control

// For Vitest, we'll use beforeAll and afterAll in the test files
// This gives tests more control over when MSW starts/stops

// However, we can provide a convenience function for one-off usage
/**
 * Run a test with MSW active.
 * Use this for simple cases where you want MSW active for a single test.
 */
export async function withMsw(
  fn: () => Promise<unknown> | unknown,
  handlers = defaultHandlers,
): Promise<unknown> {
  const server = createMswServer(handlers);

  server.listen({
    onUnhandledRequest: "bypass",
  });

  try {
    return await fn();
  } finally {
    server.close();
  }
}

// ============================================================================
// Setup for Before/After All Hooks
// ============================================================================

// Export a function that returns setup/teardown functions for Vitest
// This pattern works well with Vitest's beforeAll/afterAll hooks

export function createMswLifecycle(handlers = defaultHandlers) {
  return {
    before: () => startMswServer(handlers),
    after: () => stopMswServer(),
  };
}

// ============================================================================
// Node.js Specific Setup
// ============================================================================

// For Node.js environments (non-browser tests)
// The server.ts file is configured for Node.js
// For browser tests with @vitest/browser, the setup is similar
// but uses setupWorker from msw/browser instead

/**
 * Create a browser-compatible MSW setup.
 * Use this for tests running in browser mode.
 */
export function createBrowserMswSetup(handlers = defaultHandlers) {
  const { setupWorker: setupBrowserWorker } = require("msw/browser");

  const server = setupBrowserWorker(...handlers);

  return {
    start: () =>
      server.start({
        onUnhandledRequest: "bypass",
      }),
    stop: () => server.stop(),
    reset: () => server.resetHandlers(),
    use: (...newHandlers: Parameters<typeof setupBrowserWorker>[0]) => {
      server.resetHandlers(...newHandlers);
    },
  };
}
