/**
 * Post-build helper for GitHub Pages SPA fallback.
 *
 * GitHub Pages serves 404.html (or any file that resolves to a 404) when a
 * path doesn't exist on the server. To make deep links like
 * `https://<owner>.github.io/Date-Night/success` work in an SPA, we copy
 * `dist/index.html` to `dist/404.html`. The SPA then boots from 404.html
 * and TanStack Router reads the path from `window.location.pathname`,
 * rendering the correct view.
 */

const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

if (!fs.existsSync(indexPath)) {
  console.error("copy-404: dist/index.html was not produced by vite build. Did the build fail?");
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log(`copy-404: wrote ${path.relative(path.resolve(__dirname, ".."), notFoundPath)}`);
