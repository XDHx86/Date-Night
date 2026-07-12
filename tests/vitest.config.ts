/**
 * Vitest configuration orchestrator.
 *
 * Each Vitest "project" is a focused environment for one layer of the
 * test pyramid. Inline projects let us scope coverage, environment,
 * paths, and timeouts per slice without duplicating config files.
 *
 *   • unit          – pure modules (hooks, lib helpers), jsdom + MSW
 *   • integration   – React components + state manager, jsdom + MSW
 *   • ssr           – SSR / hydration contract tests (happy-dom)
 *   • api           – fetch-level API contract tests (MSW handlers reused)
 *   • smoke         – fast post-build sanity checks
 *
 * Coverage thresholds are scoped per project so the UI surface — which
 * changes more rapidly — does not block the build on coverage churn.
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Use absolute paths and (find, replacement) tuples — Vitest's inline
// project configs don't reliably apply the object-key form for aliases.
const repoRoot = path.resolve(__dirname, "..");
const alias = {
  find: /^@\//,
  replacement: path.resolve(repoRoot, "src") + path.sep,
};

const componentAlias = {
  find: /^@\/components\//,
  replacement: path.resolve(repoRoot, "src/components") + path.sep,
};
const hooksAlias = {
  find: /^@\/hooks\//,
  replacement: path.resolve(repoRoot, "src/hooks") + path.sep,
};
const libAlias = {
  find: /^@\/lib\//,
  replacement: path.resolve(repoRoot, "src/lib") + path.sep,
};
const routesAlias = {
  find: /^@\/routes\//,
  replacement: path.resolve(repoRoot, "src/routes") + path.sep,
};
const assetsAlias = {
  find: /^@\/assets\//,
  replacement: path.resolve(repoRoot, "src/assets") + path.sep,
};

const aliasList = [alias, componentAlias, hooksAlias, libAlias, routesAlias, assetsAlias];

const coverageExclude = [
  "src/**/*.d.ts",
  "src/routeTree.gen.ts",
  "src/start.ts",
  "src/server.ts",
  "src/lib/lovable-error-reporting.ts",
  "src/styles.css",
  "**/*.config.*",
];

/**
 * Each project is a complete inline config (Vite-style). Inline projects
 * require their own `resolve.alias` (and `root`) — they don't inherit the
 * parent config's `resolve` block automatically.
 */
const projectBase = {
  root: repoRoot,
  resolve: { alias: aliasList },
  plugins: [react()],
} as const;

const projects = [
  {
    ...projectBase,
    test: {
      name: "unit",
      include: ["tests/unit/**/*.test.{ts,tsx}"],
      environment: "jsdom",
      setupFiles: ["./tests/__mocks__/server.ts", "./tests/utils/test-setup.ts"],
      css: true,
      globals: true,
      isolate: true,
      testTimeout: 10_000,
      hookTimeout: 10_000,
      retries: process.env.CI ? 2 : 0,
      coverage: {
        enabled: true,
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage/unit",
        include: ["src/hooks/**", "src/lib/**"],
        exclude: coverageExclude,
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
    },
  },
  {
    ...projectBase,
    test: {
      name: "integration",
      include: ["tests/integration/**/*.test.{ts,tsx}", "!tests/integration/ssr/**"],
      environment: "jsdom",
      setupFiles: ["./tests/__mocks__/server.ts", "./tests/utils/test-setup.ts"],
      css: true,
      globals: true,
      isolate: true,
      testTimeout: 15_000,
      hookTimeout: 15_000,
      retries: process.env.CI ? 2 : 0,
      coverage: {
        enabled: true,
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage/integration",
        include: ["src/components/**", "src/routes/**"],
        exclude: coverageExclude,
        thresholds: {
          lines: 0,
          functions: 0,
          branches: 0,
          statements: 0,
        },
      },
    },
  },
  {
    ...projectBase,
    test: {
      name: "ssr",
      include: ["tests/integration/ssr/**/*.test.{ts,tsx}"],
      environment: "jsdom",
      setupFiles: ["./tests/utils/test-setup.ts"],
      css: false,
      globals: true,
      isolate: true,
      testTimeout: 15_000,
      retries: process.env.CI ? 2 : 0,
      coverage: { enabled: false },
    },
  },
  {
    ...projectBase,
    test: {
      name: "api",
      include: ["tests/api/**/*.test.{ts,tsx}"],
      environment: "node",
      setupFiles: ["./tests/utils/test-setup-node.ts"],
      globals: true,
      isolate: true,
      testTimeout: 20_000,
      retries: process.env.CI ? 2 : 0,
      coverage: {
        enabled: true,
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage/api",
        include: ["src/lib/movies.ts"],
        exclude: coverageExclude,
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
  },
  {
    ...projectBase,
    test: {
      name: "smoke",
      include: ["tests/smoke/**/*.test.{ts,tsx}"],
      environment: "node",
      setupFiles: ["./tests/utils/test-setup-node.ts"],
      globals: true,
      isolate: false,
      testTimeout: 30_000,
      retries: process.env.CI ? 1 : 0,
      coverage: { enabled: false },
    },
  },
];

export default defineConfig({
  test: {
    projects,
    outputFile: {
      junit: "./test-results/junit-vitest.xml",
    },
    passThroughEnv: [
      "VITE_TMDB_API_KEY",
      "VITE_TMDB_READ_ACCESS_TOKEN",
      "VITE_SPOTIFY_PLAYLIST_ID",
      "VITE_LOVE_LETTER_CATEGORY",
      "VITE_RESEND_API_KEY",
      "VITE_PORT",
      "PORT",
      "NODE_ENV",
      "MSW_ENABLED",
    ],
  },
});
