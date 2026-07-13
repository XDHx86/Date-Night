# Technology Stack

## Overview

Datenight is a fully client-side React SPA — built with **Vite** and bundled into a static `dist/` that is deployed to **GitHub Pages**. There is no SSR, no server functions, and no Node runtime involved in production.

## Core Framework

| Package                             | Why                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `vite` ^8.1.3                       | The de facto fast build tool for modern web apps.                      |
| `@vitejs/plugin-react` ^5.2.0       | JSX / React Refresh / Fast Refresh wiring.                             |
| `@tanstack/react-router` ^1.170.17  | Type-safe client-side router.                                          |
| `@tanstack/router-plugin` ^1.168.19 | Vite plugin that generates `src/routeTree.gen.ts` from `src/routes/*`. |
| `@tanstack/react-query` ^5.101.2    | Async state cache (available at the root).                             |
| `react` / `react-dom` ^19.2.7       | Latest stable React.                                                   |
| `typescript` ^5.9.3                 | Strict type safety.                                                    |

## Deployment

- **GitHub Pages** — `vite build` emits `dist/`, which is uploaded as the
  Pages artifact on every push to `main`. The build uses
  `BASE_PATH=/Date-Night/` so all asset URLs match the GitHub Pages host
  pattern (`<owner>.github.io/Date-Night/`).
- A post-build step copies `dist/index.html` → `dist/404.html`. GitHub
  Pages serves `404.html` for any unknown path, which lets deep links
  (e.g. shared `…/success`) boot the SPA shell before the React router
  takes over.

## State Management

- **Zustand** `^5.0.14` — minimalist state with first-class TypeScript.
  Persists to `localStorage` through the built-in `persist` middleware
  and lives at `src/lib/store.ts`.

## Styling & UI

- **Tailwind CSS** `^4.3.2` via `@tailwindcss/vite` + `tw-animate-css`
  — utility-first styling, CSS variables for the palette, and
  keyframe-driven animations.
- **Radix UI primitives** (`@radix-ui/react-*` 1.x–2.x) — accessible
  primitives under `src/components/ui/`.
- **class-variance-authority** `^0.7.1` + **tailwind-merge** `^3.6.0` +
  **clsx** `^2.1.1` — variants and class composition (`cn()` helper).
- **lucide-react** `^0.575.0` — icon set.

## Animations & Motion

- **framer-motion** `^12.42.2` — springs, `AnimatePresence`,
  gesture-driven celebrations, the persistent background cross-fade.
- **embla-carousel-react** `^8.6.0` — pulled in for future use.

## Forms & Validation

- **react-hook-form** `^7.81.0` + **@hookform/resolvers** `^5.4.0`
- **zod** `^4.4.3`

## Data & Utilities

- **date-fns** `^4.4.0` — date formatting / arithmetic.
- **sonner** `^2.0.7` — toast notifications.
- **vaul** `^1.1.2` — mobile drawer.
- **input-otp** `^1.4.2` — OTP input.
- **cmdk** `^1.1.1` — command palette.
- **recharts** `^2.15.4` — charting (not currently used by product code).
- **react-day-picker** `^9.14.0` — date picker (available in UI).
- **react-resizable-panels** `^4.12.1` — layout helpers.

## Development Tooling

- **eslint** `^9.39.4` with `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `eslint-plugin-prettier`, `eslint-config-prettier`.
- **prettier** `^3.9.4`.
- **globals** `^15.15.0`, **@types/node** `^22.20.1`,
  `@types/react`, `@types/react-dom`.
- **cross-env** `^7.0.3` — set `BASE_PATH` on `npm run build:gh-pages`.

## Testing

| Tool                          | Version | Role                                    |
| ----------------------------- | ------- | --------------------------------------- |
| `vitest`                      | ^3.2.4  | Unit + integration runner               |
| `@vitest/coverage-v8`         | ^3.2.4  | Coverage                                |
| `@vitest/browser`             | ^3.2.4  | Optional in-browser runner              |
| `jsdom`                       | ^25.0.1 | DOM emulation for Vitest                |
| `@testing-library/react`      | ^16.0.1 | Component testing                       |
| `@testing-library/jest-dom`   | ^6.6.2  | Custom matchers                         |
| `@testing-library/user-event` | ^14.5.2 | Event simulation                        |
| `@playwright/test`            | ^1.48.0 | E2E browser testing                     |
| `axe-core`                    | ^4.11.0 | Accessibility scans during E2E          |
| `msw`                         | ^2.7.0  | API mocking in unit / integration tests |
| `@faker-js/faker`             | ^9.5.0  | Synthetic test data                     |

## Environment Variables

All variables live in `.env` and are typed in `src/lib/env.ts`.
See [`.env.example`](../.env.example) for the canonical list. Required
combinations:

| Variable                      | Notes                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`           | TMDb v3 API key (required together with the read token)                                                           |
| `VITE_TMDB_READ_ACCESS_TOKEN` | Preferred for production TMDb requests (`Authorization: Bearer`)                                                  |
| `VITE_SPOTIFY_PLAYLIST_ID`    | Optional — gates the Spotify embed                                                                                |
| `VITE_RESEND_API_KEY`         | Reserved for future email integration                                                                             |
| `VITE_LOVE_LETTER_CATEGORY`   | `default` \| `birthday` \| `anniversary` \| `valentine` (defaults to `default`)                                   |
| `BASE_PATH`                   | Used at build time only. Sets the Vite `base` for non-default deployments (e.g. `/Date-Night/` for GitHub Pages). |

## Browser Support

Targets evergreen Chromium, Firefox, Safari and Edge. Features in use:

- ES modules
- CSS custom properties (`:root` variables, `oklch` colours)
- Fetch API + `Promise` + `async/await`
- `DeviceMotionEvent` (for the shake Easter egg)

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────┐
│ Browser (only)                                          │
│                                                          │
│  index.html  ←  /404.html (SPA fallback for deep links) │
│      ↓                                                  │
│  React 19  ←  Zustand store  ←  useUrlSync  ←  URL     │
│      │            │                   │                 │
│      ▼            ▼                   ▼                 │
│   UI components   localStorage       TanStack Router     │
│   (PageShell,                                        │  │
│    TopProgressBar,                                   │  │
│    BackgroundLayer)                                   │  │
└──────────────────────────────────────────────────────────┘
```

## Why This Stack?

- **Vite** — fast development, simple build, no Node server required.
- **TanStack Router (file-based)** — generated route tree, type-safe
  navigation, deep-link friendly, works without any server-side render.
- **Zustand + `useUrlSync`** — persistent and shareable state without
  Redux or context boilerplate.
- **Tailwind v4** — fast iteration with first-class support for CSS
  variables, keyframes, and the design-system primitives in `styles.css`.
- **Vitest + Playwright + axe + MSW** — a comprehensive test pyramid
  without leaving JavaScript.

## Further Reading

- [package.json](../package.json) — exact pinned versions.
- [vite.config.ts](../vite.config.ts) — the (now very small) Vite config.
