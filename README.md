# Datenight

A playful, interactive date-night planner built with TanStack Start, React, and modern web technologies.

## Overview

Datenight guides users through planning a perfect date night step-by-step:

1. Ask a fun yes/no question to start ([`/`](src/routes/index.tsx))
2. Pick a date for your outing ([`/date`](src/routes/date.tsx))
3. Select a time of day ([`/time`](src/routes/time.tsx))
4. Choose a movie to watch together with live TMDb search ([`/movie`](src/routes/movie.tsx))
5. Customise a love letter ([`/love-letter`](src/routes/love-letter.tsx))
6. Compute a shared countdown timer ([`/summary`](src/routes/summary.tsx))
7. Celebrate your completed plan ([`/success`](src/routes/success.tsx))

The app features route-aware animated backgrounds, persistent state storage (URL + localStorage), a shake-to-celebrate Easter egg, optional background audio, optional Spotify embed, share-as-image love cards, and a delightful user experience.

## Documentation

Detailed documentation is available in the [`/docs`](docs) directory:

- [Overview](docs/overview.md) — Project purpose and feature highlights
- [Technology Stack](docs/tech-stack.md) — Dependency breakdown
- [Getting Started](docs/getting-started.md) — Installation, environment, scripts
- [Project Structure](docs/project-structure.md) — Source tree walkthrough
- [Routing System](docs/routing.md) — File-based routing & URL sync
- [State Management](docs/state-management.md) — Zustand + URL sync
- [Features](docs/features.md) — Per-screen behaviour
- [Testing Guide](docs/testing.md) — Unit / integration / E2E patterns
- [CI/CD Documentation](docs/ci-cd.md) — Workflows and release process
- [Contributing](docs/contributing.md) — Coding standards & PR process
- [FAQ](docs/faq.md) — Common questions
- [Missing / TODO](docs/missing.md) — Known gaps & follow-up ideas

## Quick Start

```bash
# Install dependencies (Bun is the project's primary package manager)
bun install

# Start the dev server (defaults to http://localhost:8080)
bun run dev
```

The application boots on port `3000` by default (configurable via `PORT` or
`VITE_PORT`). Authentication is not required.

## Environment

Optional integrations are enabled through environment variables. Copy
[`.env.example`](.env.example) to `.env` and fill in the values you need:

| Variable                      | Purpose                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`           | TMDb v3 API key (required together with the read token for live movie data)                     |
| `VITE_TMDB_READ_ACCESS_TOKEN` | TMDb v4 read token (preferred for TMDB searches — see `src/lib/movies.ts`)                      |
| `VITE_SPOTIFY_PLAYLIST_ID`    | Shows an embedded Spotify player on summary / success when set                                  |
| `VITE_RESEND_API_KEY`         | Reserved for future email integration                                                           |
| `VITE_LOVE_LETTER_CATEGORY`   | Choose which love-letter set is active: `default` \| `birthday` \| `anniversary` \| `valentine` |

The detailed feature-gating contract lives in [`src/lib/env.ts`](src/lib/env.ts). The app boots without any
of these set — each integration only renders when its variable is populated.

## Scripts

| Command                          | What it does                                              |
| -------------------------------- | --------------------------------------------------------- |
| `bun run dev`                    | Start the dev server (Vite)                               |
| `bun run build`                  | Production build                                          |
| `bun run preview`                | Preview the production build                              |
| `bun run typecheck`              | `tsc --noEmit`                                            |
| `bun run lint`                   | ESLint across the project                                 |
| `bun run lint:fix`               | ESLint with `--fix`                                       |
| `bun run format`                 | Prettier write                                            |
| `bun run format:check`           | Prettier verify                                           |
| `bun run test`                   | Vitest run (all projects, no coverage)                    |
| `bun run test:watch`             | Vitest in watch mode                                      |
| `bun run test:coverage`          | Vitest with V8 coverage for the `unit` project            |
| `bun run test:unit`              | Vitest only the `unit` project                            |
| `bun run test:integration`       | Vitest only the `integration` project                     |
| `bun run test:ssr`               | Vitest only the `ssr` project                             |
| `bun run test:api`               | Vitest only the `api` project                             |
| `bun run test:smoke`             | Vitest only the `smoke` project                           |
| `bun run test:e2e`               | Playwright (all projects)                                 |
| `bun run test:e2e:smoke`         | Playwright `smoke` project only                           |
| `bun run test:e2e:visual`        | Playwright `visual` project only                          |
| `bun run test:e2e:accessibility` | Playwright `accessibility` project only                   |
| `bun run test:e2e:performance`   | Playwright `performance` project only                     |
| `bun run test:e2e:regression`    | Playwright `regression` project only                      |
| `bun run test:e2e:security`      | Playwright `security` project only                        |
| `bun run test:e2e:user-journeys` | Playwright `user-journeys-desktop` project only           |
| `bun run newman:run`             | Run the bundled Postman collection against the dev server |
| `bun run check`                  | typecheck + lint + format:check + unit tests              |
| `bun run check:full`             | The full local pipeline mirror of CI                      |
| `bun run validate:build`         | Production build with a success marker                    |

## Testing & Quality

Comprehensive test infrastructure under [`tests/`](tests):

- **Unit tests** — hooks and library code (`tests/unit/`, Vitest `unit` project)
- **Integration tests** — components, router, state, error boundary (`tests/integration/`, Vitest `integration` project)
- **SSR & hydration** — `tests/integration/ssr/`, Vitest `ssr` project (happy-dom)
- **API tests** — MSW-backed TMDb contract tests (`tests/api/`, Vitest `api` project) plus the bundled Postman/Newman collection
- **Smoke tests** — post-build sanity invariants (`tests/smoke/` and `tests/e2e/smoke/`)
- **End-to-end** — Playwright user journeys across Chromium / Firefox / WebKit and mobile + tablet viewports
- **Visual regression** — committed baselines for `landing`, `date`, `time`, `movie`
- **Accessibility** — `axe-core` scans via Playwright
- **Performance** — FCP / DCL / transfer budgets pinned in `tests/e2e/performance/`
- **Security** — key hygiene, header checks, input boundaries (`tests/e2e/security/`)
- **Regression** — previously fixed issues (`tests/e2e/regression/`)
- **Error boundary** — graceful runtime-error handling (`tests/e2e/error-boundary/`)
- **Cross-browser / Responsive** — `*.browser.test.ts` and `*.responsive.test.ts`
- **API mocking** — MSW handlers for deterministic responses
- **Test data** — `@faker-js/faker` factories, static fixtures (`factories/`, `fixtures/`)

See [docs/testing.md](docs/testing.md) for the full layout and conventions.

The repository is set up with continuous integration under
[`.github/workflows/`](.github/workflows/) covering:

- **Main CI** (`ci.yml`) — orchestrator with format-check, lint, build, unit, integration, SSR, API, smoke, E2E, security, dependency validation
- **Lint** (`lint.yml`, Bun + npm parity)
- **Format-check** (`format-check.yml`, isolated Prettier check)
- **Test** (`test.yml`, Vitest unit + integration + SSR + coverage)
- **Build** (`build.yml`, Bun + npm parity, bundle-size report)
- **API tests** (`api-tests.yml`, Vitest + Newman)
- **Smoke tests** (`smoke-tests.yml`, post-build Playwright smoke)
- **E2E** (`e2e.yml`, full browser + device matrix)
- **Security** (`security.yml`, audits + CodeQL + dep-review)
- **Dependency validation** (`dependency-validation.yml`, lockfile parity + supply-chain guard)
- **Coverage summary** (`coverage-summary.yml`, PR-comment coverage table)
- **Preview deploy** (`preview-deploy.yml`, Cloudflare Pages)
- **Release** (`release.yml`, manual draft release with asset bundling)
- **Reusable setups** (`reusable/setup-bun.yml`, `setup-npm.yml`,
  `setup-bun-playwright.yml`) for a single source of install truth.

See [docs/ci-cd.md](docs/ci-cd.md).

## Recent Highlights (May — July 2026)

- **Persistent backdrop system** — `BackgroundContext`, `BackgroundLayer`,
  `BackgroundVariantSync` keep a cross-fading gradient alive across route
  changes without remounting.
- **Lock-screen progress bar** — `TopProgressBar` lives at the root,
  derives the active step from the URL, and locks navigation on
  `/success`.
- **Bottom control bar** — global dark / audio / love-letter shortcuts
  factoring out the once-floating buttons.
- **Live TMDb integration** — `src/lib/movies.ts` normalises search / details
  responses into a single `Movie` shape, caches the curated IDs locally for
  seven days, and gracefully falls back to recommendations on failure.
- **Love-letter categories** — `src/data/loveLetters.ts` ships default,
  birthday, anniversary and valentine sets; `VITE_LOVE_LETTER_CATEGORY`
  picks which to render.
- **Share-as-image love card** — `/love-letter` exports a PNG via
  `canvas`, with Web Share API + download fallback.
- **URL ⇄ store sync** — `src/hooks/useUrlSync.ts` is the single source of
  truth; everything uses `navigate()` rather than `window.history`.
- **Hydration-safe randomness** — `useRandomMessage`,
  `ConfettiCelebration`, and friends defer random values to `useEffect`
  so SSR / first client render line up.

## Project Health (snapshot)

| Aspect                  | Status                 |
| ----------------------- | ---------------------- |
| TypeScript strict       | ✅ clean               |
| ESLint + Prettier       | ✅ clean               |
| Vitest unit / coverage  | ✅                     |
| Playwright (3 browsers) | ✅, with accessibility |
| Visual regression       | ✅                     |
| CI / Coverage / Release | ✅ GitHub Actions      |
| TMDb integration        | ✅                     |
| Backgrounds / progress  | ✅                     |

## License

MIT — see the [LICENSE](license) file.
