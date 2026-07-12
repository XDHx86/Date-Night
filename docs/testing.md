# Testing Guide

This guide covers the full test pyramid for the Datenight project:
unit, integration, end-to-end, accessibility, and visual regression.

## Stack

| Tool                                | Purpose                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| **Vitest**                          | Unit + integration runner (`jsdom`)                      |
| **@testing-library/react**          | Render API and queries                                   |
| **@testing-library/user-event**     | Realistic user event simulation                          |
| **@testing-library/jest-dom**       | Custom DOM matchers                                      |
| **MSW**                             | Network mocking for unit / integration                   |
| **Playwright**                      | E2E + visual + accessibility tests in real browsers      |
| **axe-core**                        | Accessibility audits                                     |
| **@faker-js/faker**                 | Synthetic data factories                                 |

## Quick Start

```bash
# Install dependencies (Bun is the primary tool)
bun install

# Install Playwright browsers (one-off)
bun run playwright:install

# Run unit + integration tests
bun run test

# Watch mode
bun run test:watch

# Open the Vitest UI
bun run test:ui

# With coverage
bun run test:coverage

# Playwright E2E (UI / headed / debug variants below)
bun run test:e2e
bun run test:e2e:ui
bun run test:e2e:headed
bun run test:e2e:debug

# Run every check
bun run check
```

## Test Directory Layout

```
tests/
├── __mocks__/                # MSW handlers + server
│   ├── handlers.ts
│   └── server.ts
├── api/                      # API / TMDb integration tests
├── e2e/
│   ├── accessibility/        # axe scans (a11y-scan.test.ts)
│   ├── fixtures/             # Playwright fixtures (custom `test`, helpers)
│   ├── user-journeys/        # yes-journey / no-journey suites
│   ├── visual/               # visual regression (landing-page.test.ts)
│   └── setup.ts              # global setup
├── factories/                # Synthetic data (movieFactory, dateFactory)
├── fixtures/                 # Static test data
├── integration/              # Component / store integration tests
│   └── components/
│       └── MovieCard.test.tsx
├── smoke/                    # Build smoke tests
├── unit/                     # Pure unit tests (Vitest)
│   ├── hooks/                # useUrlSync, useRandomMessage, useShakeEffect, ...
│   └── lib/                  # store, movies, messages, sound, utils
├── utils/                    # test-utils.tsx, test-setup.ts
└── vitest.config.ts
```

## Configuration

- **Vitest** (`tests/vitest.config.ts`)
  - `jsdom` environment
  - Reuses the TS path aliases (`@/`, `@/components/`, ...)
  - 80 % coverage thresholds (lines / functions / branches / statements)
  - Setup files wire up MSW + global test setup
- **Playwright** (`playwright.config.ts`)
  - Projects: `setup`, `chromium`, `firefox`, `webkit`, `mobile-chrome`,
    `visual`, `accessibility`
  - Snapshots committed via the `visual` project (1280×800 chrome)
  - `auto-start` server uses `bun run dev` on PORT (default 3000)
  - `globalSetup` runs `tests/e2e/setup.ts`
  - `MSW_ENABLED=true` env by default

## Writing Tests

### Unit Test Skeleton

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { functionToTest } from "../../../src/lib/moduleName";

describe("Module: functionName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do something expected", () => {
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
import { ComponentName } from "../../../src/components/ComponentName";
import { renderWithProviders } from "../../utils/test-utils";

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

### E2E Test Skeleton

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

### Accessibility

```ts
import AxeBuilder from "@axe-core/playwright";

test("landing has no a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Conventions & Best Practices

- **Naming**: `it("should do X when Y")` is encouraged over `it("works")`.
- **AAA pattern** (Arrange / Act / Assert).
- **Test one thing per `it`**.
- **Prefer factories / fixtures** over inlined objects.
- **Avoid testing implementation details** — exercise behaviour, not
  internals.
- **Mock MSW for every external call** (TMDb, Spotify).
- **Reset Zustand between tests**:
  `beforeEach(() => useDateStore.getState().reset());`
- **Clear mocks**: `vi.clearAllMocks()` / `vi.resetAllMocks()` as
  needed.

## Coverage

- Generated under `coverage/` (HTML, lcov, json, text).
- Thresholds (lines / functions / branches / statements): `80`.
- Excluded from coverage:
  - `src/**/*.d.ts`
  - `src/routeTree.gen.ts`
  - `src/start.ts`, `src/server.ts`
  - `*​*.config.*`

View locally: `open coverage/index.html` (macOS) or
`start coverage/index.html` (Windows).

## Debugging

- `bun run test -t "name"` — run a single named test.
- `bun run test:watch` — re-run on save.
- `bun run test:e2e:ui` — Playwright's runner.
- `bun run test:e2e:debug` — Playwright debug.
- `bun run playwright:show-report` — open last HTML report.

## CI Strategy

`.github/workflows/` runs:

- TypeScript typecheck
- ESLint + Prettier
- Vitest coverage
- Playwright (chromium, firefox, webkit; mobile-chrome; a11y; visual)
- Production build verification
- Dependabot + CodeQL security scans

Coverage is published wherever the workflow is configured to upload it
(see `coverage.yml`). Visual baselines are committed, so a screenshot
diff is the only "approval" needed for any UI change.

## Common Issues

- **LocalStorage pollution** — Vitest can share `localStorage` between
  tests; reset the store, or set new keys to a unique prefix.
- **Hydration warnings** — random / `Date.now()` paths need to defer
  to `useEffect`. Check `src/hooks/useRandomMessage.ts` for the
  recipe.
- **MSW timeouts** — open handlers declared in `tests/__mocks__/handlers.ts`
  and the worker boot order in `tests/utils/test-setup.ts`.
- **Visual regression flakiness** — disable animations
  (`animations: "disabled"`) and freeze the viewport.
- **Browser-specific flakes** — keep selectors robust; assert on
  accessible roles/labels instead of class names.
