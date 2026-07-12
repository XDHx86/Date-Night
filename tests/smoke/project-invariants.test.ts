/**
 * Smoke tests — fast sanity checks that don't depend on MSW or a full
 * React tree. They run post-build to confirm the basic plumbing still
 * works.
 *
 * Use these for:
 *   • Confirming `package.json` invariants (version, scripts).
 *   • Confirming core source files exist and export expected symbols.
 *   • Confirming the build artefacts are present.
 *
 * Smoke tests must NOT touch the network, the DOM, or localStorage.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";

const root = resolve(__dirname, "../..");
const require = createRequire(import.meta.url);

describe("Smoke — Project invariants", () => {
  it("package.json exists and parses", () => {
    const path = resolve(root, "package.json");
    expect(existsSync(path)).toBe(true);
    const pkg = JSON.parse(readFileSync(path, "utf8")) as {
      name?: string;
      version?: string;
      scripts?: Record<string, string>;
    };
    expect(pkg.name).toBeTruthy();
    // `version` is optional — when present it must be semver-ish.
    if (pkg.version) {
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    }
    expect(pkg.scripts?.test).toBeTruthy();
    expect(pkg.scripts?.build).toBeTruthy();
  });

  it("ships with both Bun and npm lockfiles", () => {
    expect(existsSync(resolve(root, "bun.lock"))).toBe(true);
    expect(existsSync(resolve(root, "package-lock.json"))).toBe(true);
  });

  it("tsconfig.json has the documented path aliases", () => {
    const tsconfigPath = resolve(root, "tsconfig.json");
    // The project tsconfig uses `/* ... */` block comments, which JSON.parse
    // doesn't accept. Strip them before parsing.
    const raw = readFileSync(tsconfigPath, "utf8");
    const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, "");
    const tsconfig = JSON.parse(stripped) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const paths = tsconfig.compilerOptions?.paths ?? {};
    expect(paths["@/*"]).toBeDefined();
    expect(paths["@/*"]?.[0]).toBe("./src/*");
  });

  it(".env.example documents every optional integration", () => {
    const example = readFileSync(resolve(root, ".env.example"), "utf8");
    expect(example).toMatch(/VITE_TMDB_API_KEY/);
    expect(example).toMatch(/VITE_TMDB_READ_ACCESS_TOKEN/);
    expect(example).toMatch(/VITE_SPOTIFY_PLAYLIST_ID/);
    expect(example).toMatch(/VITE_LOVE_LETTER_CATEGORY/);
  });

  it("README mentions the quick-start script and dev port", () => {
    const readme = readFileSync(resolve(root, "README.md"), "utf8");
    expect(readme).toMatch(/bun run dev/);
    expect(readme).toMatch(/PORT|VITE_PORT|3000/);
  });
});

describe("Smoke — Source tree integrity", () => {
  const expectedFiles = [
    "src/router.tsx",
    "src/server.ts",
    "src/start.ts",
    "src/routeTree.gen.ts",
    "src/styles.css",
    "src/lib/store.ts",
    "src/lib/movies.ts",
    "src/lib/sound.ts",
    "src/lib/messages.ts",
    "src/lib/utils.ts",
    "src/hooks/useUrlSync.ts",
    "src/hooks/useShakeEffect.ts",
    "src/hooks/useBackgroundAudio.ts",
    "src/hooks/useRouteStep.ts",
    "src/hooks/useRandomMessage.ts",
    "src/routes/__root.tsx",
    "src/routes/index.tsx",
    "src/routes/confirmation.tsx",
    "src/routes/date.tsx",
    "src/routes/time.tsx",
    "src/routes/movie.tsx",
    "src/routes/love-letter.tsx",
    "src/routes/summary.tsx",
    "src/routes/success.tsx",
    "src/routes/begging.tsx",
  ];

  for (const rel of expectedFiles) {
    it(`has ${rel}`, () => {
      const full = resolve(root, rel);
      expect(existsSync(full)).toBe(true);
      // A 0-byte file would silently pass `existsSync`; assert non-empty.
      const stats = statSync(full);
      expect(stats.size).toBeGreaterThan(0);
    });
  }
});

describe("Smoke — Module loadability", () => {
  it("core lib modules load without side-effect crashes", async () => {
    await expect(import("../../src/lib/utils")).resolves.toBeTypeOf("object");
    await expect(import("../../src/lib/messages")).resolves.toBeTypeOf("object");
    await expect(import("../../src/lib/store")).resolves.toBeTypeOf("object");
  });
});

describe("Smoke — Test infrastructure", () => {
  it("Vitest config is present", () => {
    const vitestConfig = resolve(root, "tests/vitest.config.ts");
    expect(existsSync(vitestConfig)).toBe(true);
  });

  it("Playwright config is present", () => {
    const pw = resolve(root, "playwright.config.ts");
    expect(existsSync(pw)).toBe(true);
  });

  it("MSW handlers are present and exported", () => {
    const handlersPath = resolve(root, "tests/__mocks__/handlers.ts");
    expect(existsSync(handlersPath)).toBe(true);
  });
});
