# Testing Guide

Comprehensive guide to Datenight's test pyramid.

## Stack

| Tool                            | Purpose                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest**                      | Unit + integration runner (multi-project, jsdom)                                                                                      |
| **@testing-library/react**      | Render API and queries                                                                                                                |
| **@testing-library/user-event** | Realistic user event simulation                                                                                                       |
| **@testing-library/jest-dom**   | Custom DOM matchers                                                                                                                   |
| **MSW**                         | Network mocking for unit / integration                                                                                                |
| **Playwright**                  | Browser E2E (chromium / firefox / webkit / mobile / tablet), visual, accessibility, performance, security, regression, error-boundary |
| **axe-core** (via Playwright)   | Accessibility audits                                                                                                                  |
| **@faker-js/faker**             | Synthetic data factories                                                                                                              |

## Quick Start

```bash
# Install dependencies (npm is the primary tool)
npm install

# Install Playwright browsers (one-off)
npm run playwright:install

# Fastest loop — typecheck + lint + format + unit tests
npm run check

# Full local matrix — mirrors CI
npm run check:full

# Vitest project slices
npm run test:unit
npm run test:integration
npm run test:api
npm run test:smoke

# Vitest UI
npm run test:ui
npm run test:watch
npm run test:coverage

# Playwright slices
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
npm run test:e2e:smoke
npm run test:e2e:visual
npm run test:e2e:accessibility
npm run test:e2e:performance
npm run test:e2e:regression
npm run test:e2e:security
npm run test:e2e:user-journeys
npm run test:e2e:mobile
npm run test:e2e:tablet

# Cycle the formatting
npm run format          # write
npm run format:check    # verify
```

## Test Directory Layout

```
tests/
├── __mocks__/                # MSW handlers + server (Node + browser)
│   ├── handlers.ts
│   └── server.ts
├── api/                      # API / TMDb integration tests (Vitest project: api)
├── e2e/
│   ├── accessibility/        # axe scans (a11y-scan.test.ts)         → project: accessibility
│   ├── cross-browser.*.browser.test.ts   → projects: chromium, firefox, webkit
│   ├── cross-browser.*.responsive.test.ts → projects: mobile-chrome, mobile-safari, tablet
│   ├── error-boundary/       # graceful-error regression             → project: error-boundary
│   ├── fixtures/             # Playwright fixtures (custom `test`)
│   ├── performance/          # performance budgets (FCP, LCP, transfer) → project: performance
│   ├── regression/           # previously-fixed issues                → project: regression
│   ├── security/             # CSP / key hygiene / input boundaries   → project: security
│   ├── smoke/                # post-build sanity checks               → project: smoke
│   ├── user-journeys/        # yes / no flows                         → project: user-journeys-desktop
│   ├── visual/               # visual regression                      → project: visual
│   ├── baselines/            # committed snapshot baselines
│   └── setup.ts              # global setup
├── factories/                # Synthetic data (movieFactory, dateFactory)
├── fixtures/                 # Static test data (movies, store-states)
├── integration/              # Vitest project: integration (jsdom)
│   ├── components/           # MovieCard / PageShell / AnimatedButton
│   ├── error-boundary/       # error-capture behaviour
│   ├── router/               # progress-mapping contract
│   └── state/                # Zustand store mutation contract
├── smoke/                    # Vitest project: smoke (Node, no MSW)
├── unit/                     # Vitest project: unit (jsdom + MSW)
│   ├── hooks/                # useUrlSync, useRandomMessage, ...
│   └── lib/                  # store, movies, messages, sound, utils
├── utils/                    # test-utils.tsx, test-setup.ts
└── vitest.config.ts          # multi-project setup
```

## Vitest Projects

`tests/vitest.config.ts` declares four Vitest projects. Each has its
own environment, setup files, coverage scope, and thresholds.

| Project       | Environment | Includes               | Coverage gate                        |
| ------------- | ----------- | ---------------------- | ------------------------------------ |
| `unit`        | jsdom + MSW | `tests/unit/**`        | 80% lines / 80% funcs / 75% branches |
| `integration` | jsdom + MSW | `tests/integration/**` | informational only                   |
| `api`         | node + MSW  | `tests/api/**`         | 80% lines / 80% funcs / 70% branches |
| `smoke`       | node        | `tests/smoke/**`       | disabled                             |

A global JUnit XML is emitted at `test-results/junit-vitest.xml` for
CI consumption. Per-project reports land under `coverage/{project}/`.

## Playwright Projects

`playwright.config.ts` declares Playwright projects. The browser matrix
(chromium / firefox / webkit / mobile-chrome / mobile-safari / tablet)
plus visual / accessibility / performance / regression / security /
error-boundary all run from a single configuration. The dev server is
started automatically:

```ts
webServer: { command: "npm run dev", url: "http://localhost:3000/", ... }
```

| Project                 | Matches                                      | Notes                                    |
| ----------------------- | -------------------------------------------- | ---------------------------------------- |
| `setup`                 | any `*.smoke.test.ts` (Playwright only)      | global setup (default project if used)   |
| `smoke`                 | `smoke/*.test.ts`                            | post-build sanity                        |
| `user-journeys-desktop` | `user-journeys/*.test.ts`                    | full happy-path flows                    |
| `visual`                | `visual/*.test.ts`                           | committed screenshots, 2% diff budget    |
| `accessibility`         | `accessibility/*.test.ts`                    | axe-core scans                           |
| `performance`           | `performance/*.test.ts`                      | FCP / DCL / transfer budgets             |
| `regression`            | `regression/*.test.ts`                       | previously-fixed issues                  |
| `error-boundary`        | `error-boundary/*.test.ts`                   | graceful runtime-error handling          |
| `security`              | `security/*.test.ts`                         | key hygiene / headers / input boundaries |
| `chromium`              | `*.browser.test.ts`                          | cross-browser matrix                     |
| `firefox`               | `*.browser.test.ts`                          | cross-browser matrix                     |
| `webkit`                | `*.browser.test.ts`                          | cross-browser matrix                     |
| `mobile-chrome`         | `*.browser.test.ts` ∪ `*.responsive.test.ts` | Pixel 5                                  |
| `mobile-safari`         | `*.browser.test.ts` ∪ `*.responsive.test.ts` | iPhone 13                                |
| `tablet`                | `*.responsive.test.ts`                       | iPad (gen 7)                             |

## Writing Tests

### Unit Test Skeleton

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { functionToTest } from "@/lib/moduleName";

describe("Module: functionName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does the expected thing when given X", () => {
    const out = functionToTest("test");
    expect(out).toBe("expected");
  });
});
```

### Component Test Skeleton

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "@/components/ComponentName";
import { renderWithProviders } from "@/tests/utils/test-utils";

describe("ComponentName", () => {
  it("renders default state", () => {
    render(<ComponentName />);
    expect(screen.getByText("Default Text")).toBeInTheDocument();
  });

  it("handles clicks", async () => {
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### API Test Skeleton (MSW)

```ts
import { describe, it, expect, vi } from "vitest";
import { searchMovies } from "@/lib/movies";
import { defaultHandlers } from "@/tests/__mocks__/handlers";

vi.mock("@/lib/env", () => ({ env: {/* … */} }));

describe("TMDb: searchMovies", () => {
  it("returns up to 6 results", async () => {
    const out = await searchMovies("romance");
    expect(out.length).toBeLessThanOrEqual(6);
  });
});
```

### E2E Test Skeleton (Playwright)

```ts
import { test, expect } from "../fixtures/test";

test("user completes YES journey", async ({ page, completeYesJourney }) => {
  await completeYesJourney({
    date: "2026-07-15",
    time: "19:00",
    movie: "Scary Movie 6",
  });
  await expect(page).toHaveURL(/success/);
});
```

### Visual Regression

```ts
test("landing page matches snapshot", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("landing-page.png", {
    maxDiffPixelRatio: 0.02,
    animations: "disabled",
  });
});
```

### Accessibility (axe)

```ts
import AxeBuilder from "@axe-core/playwright";

test("landing has no a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Conventions & Best Practices

- **Naming**: prefer `it("does X when Y")`, never `it("works")`.
- **AAA pattern** (Arrange / Act / Assert).
- **Test one thing per `it`**.
- **Prefer factories / fixtures** over inline objects.
- **Avoid testing implementation details** — exercise behaviour, not
  internals.
- **Mock every external call** (TMDb, Spotify) — use MSW.
- **Reset state between tests**:
  `beforeEach(() => useDateStore.getState().reset());`.
- **Clear mocks**: `vi.clearAllMocks()` / `vi.resetAllMocks()`.
- **Visual baselines**: disable animations, freeze viewport.
- **Don't commit Playwright reports.** The `.gitignore` covers
  `playwright-report/`, `playwright-results/`, `test-results/`.

## Coverage

- Per-project coverage reports live under `coverage/{project}/`.
- The Vitest projects `unit` and `api` have numeric thresholds that
  fail the build when violated.

View locally: `open coverage/index.html` (macOS) or
`start coverage/index.html` (Windows).

## Client-render Contract

Previously there was an SSR / hydration suite under
`tests/integration/ssr/`. Now that the app is a pure SPA (Vite + TanStack
Router client-only), there is no server renderer to pin. The same
deterministic-on-first-render guarantee holds — every value that depends
on randomness or `Date.now()` is deferred to `useEffect`
(see `src/hooks/useRandomMessage.ts`). The contract is exercised in the
unit tests for the hooks themselves, rather than as a hydration suite.

## Debugging

- `npm run test -t "name"` — run a single named test.
- `npm run test:watch` — re-run on save.
- `npm run test:e2e:ui` — Playwright runner.
- `npm run test:e2e:debug` — Playwright debug.
- `npm run playwright:show-report` — last HTML report.
- `npx playwright test --project=visual --update-snapshots` — accept
  intentional visual diff.

## Common Issues

- **LocalStorage pollution** — reset the store in `beforeEach`, or set
  keys with a unique prefix per test.
- **Hydration warnings** — random / `Date.now()` paths must defer to
  `useEffect`. See `src/hooks/useRandomMessage.ts`.
- **MSW timeouts** — check open handlers in
  `tests/__mocks__/handlers.ts` and the worker boot order in
  `tests/utils/test-setup.ts`.
- **Visual regression flakiness** — disable animations
  (`animations: "disabled"`) and freeze the viewport (`1280×800`).
- **Browser-specific flakes** — assert on accessible roles/labels
  rather than class names.
