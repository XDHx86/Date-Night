/**
 * Vite configuration for the Datenight SPA.
 *
 * The previous build relied on TanStack Start (Vinxi/Nitro) which emitted
 * a Node server bundle to `.output/`. The site is now a fully static
 * React SPA — there is no server, no SSR, no middleware. This config
 * is therefore the standard Vite SPA shape: `react` for JSX, the
 * TanStack Router Vite plugin for file-based routing codegen.
 *
 * The `base` path defaults to `/` for local development. To produce a
 * build ready for GitHub Pages, set `BASE_PATH=/<repo-name>/` at build
 * time (see npm `build:gh-pages` and `npm run build` in CI).
 */

import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages projects live at /<repo-name>/. Override with BASE_PATH
// env var when building for a different deployment target.
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  plugins: [
    // Tailwind v4 engine — processes `@import "tailwindcss"`, `@theme`,
    // `@source`, `@utility`, and `@custom-variant` in styles.css. Without
    // this the CSS-first config is inert (no utilities, no tokens).
    tailwindcss(),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    // Tailwind v4 emits `@source` at-rules that lightningcss's minifier
    // does not yet recognise; esbuild handles them transparently.
    cssMinify: "esbuild",
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3000,
    strictPort: false,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 3000,
    strictPort: false,
  },
});
