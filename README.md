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

# Start the dev server (defaults to http://localhost:3000)
bun run dev
```

The application boots on port `3000` by default (configurable via `PORT` or
`VITE_PORT`). Authentication is not required.

## Environment

Optional integrations are enabled through environment variables. Copy
[`.env.example`](.env.example) to `.env` and fill in the values you need:

| Variable                       | Purpose                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `VITE_TMDB_API_KEY`            | TMDb v3 API key (required together with the read token for live movie data)                      |
| `VITE_TMDB_READ_ACCESS_TOKEN`  | TMDb v4 read token (preferred for TMDB searches — see `src/lib/movies.ts`)                       |
| `VITE_SPOTIFY_PLAYLIST_ID`     | Shows an embedded Spotify player on summary / success when set                                   |
| `VITE_RESEND_API_KEY`          | Reserved for future email integration                                                            |
| `VITE_LOVE_LETTER_CATEGORY`    | Choose which love-letter set is active: `default` \| `birthday` \| `anniversary` \| `valentine`  |

The detailed feature-gating contract lives in [`src/lib/env.ts`](src/lib/env.ts). The app boots without any
of these set — each integration only renders when its variable is populated.

## Scripts

| Command                   | What it does                                                      |
| ------------------------- | ----------------------------------------------------------------- |
| `bun run dev`             | Start the dev server (Vite)                                       |
| `bun run build`           | Production build                                                  |
| `bun run preview`         | Preview the production build                                      |
| `bun run typecheck`       | `tsc --noEmit`                                                    |
| `bun run lint`            | ESLint across the project                                         |
| `bun run lint:fix`        | ESLint with `--fix`                                               |
| `bun run format`          | Prettier write                                                    |
| `bun run test`           | Vitest (unit + integration) single run                           |
| `bun run test:watch`     | Vitest in watch mode                                              |
| `bun run test:coverage`  | Vitest with V8 coverage                                           |
| `bun run test:e2e`       | Playwright (all projects)                                         |
| `bun run test:e2e:ui`    | Playwright with the test runner UI                                |
| `bun run test:all`       | Run unit and E2E tests concurrently                               |
| `bun run check`          | `typecheck` + `lint` + `test`                                     |
| `bun run validate:build` | Production build with a success marker                            |

## Testing & Quality

Comprehensive test infrastructure under [`tests/`](tests):

- **Unit tests** — hooks and library code (`tests/unit/`)
- **Integration tests** — components and stores (`tests/integration/`)
- **E2E tests** — Playwright user journeys across Chromium / Firefox / WebKit
- **Visual regression** — committed baselines for the landing page
- **Accessibility** — `axe-core` scans via Playwright
- **API mocking** — MSW handlers for deterministic responses

See [docs/testing.md](docs/testing.md) for the full layout and conventions.

The repository is set up with continuous integration on `.github/workflows/`
covering lint, unit tests, E2E, build verification, coverage and security —
see [docs/ci-cd.md](docs/ci-cd.md).

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

| Aspect                  | Status                  |
| ----------------------- | ----------------------- |
| TypeScript strict       | ✅ clean                |
| ESLint + Prettier       | ✅ clean                |
| Vitest unit / coverage  | ✅                      |
| Playwright (3 browsers) | ✅, with accessibility  |
| Visual regression       | ✅                      |
| CI / Coverage / Release | ✅ GitHub Actions       |
| TMDb integration        | ✅                      |
| Backgrounds / progress  | ✅                      |

## License

MIT — see the [LICENSE](license) file.
