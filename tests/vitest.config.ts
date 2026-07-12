import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: "jsdom",
    globals: true,
    setupFiles: [
      "./tests/__mocks__/server.ts",
      "./tests/utils/test-setup.ts",
    ],
    css: true,

    // File handling
    include: [
      "tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: [
      "node_modules/",
      "dist/",
      ".output/",
      "**/e2e/**",
    ],

    // Coverage
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/routeTree.gen.ts",
        "src/start.ts",
        "src/server.ts",
        "**/*.config.*",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Test timeout and retries
    testTimeout: 10000,
    hookTimeout: 10000,
    retries: 1,

    // Output
    outputFile: {
      junit: "./test-results/junit.xml",
    },

    // Type checking
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.json",
    },

    // Resolve aliases matching tsconfig
    resolve: {
      alias: {
        "@/": path.resolve(__dirname, "../src"),
        "@/components/": path.resolve(__dirname, "../src/components"),
        "@/hooks/": path.resolve(__dirname, "../src/hooks"),
        "@/lib/": path.resolve(__dirname, "../src/lib"),
        "@/routes/": path.resolve(__dirname, "../src/routes"),
        "@/assets/": path.resolve(__dirname, "../src/assets"),
      },
    },

    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Isolate tests
    isolate: false,

    // Pass through environment variables
    passThroughEnv: [
      "VITE_TMDB_API_KEY",
      "VITE_TMDB_READ_ACCESS_TOKEN",
      "VITE_SPOTIFY_PLAYLIST_ID",
      "NODE_ENV",
    ],
  },

  // Vite resolve for consistency with main app
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "../src"),
    },
  },
});
