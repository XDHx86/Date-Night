# Technology Stack

## Overview

Datenight is built with a modern, batteries-included web stack —
TanStack Start on top of Vite, React 19, Tailwind CSS v4, Zustand for
state, Radix UI primitives for accessibility and Zod for validation.

## Core Framework

| Package                                | Why                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@tanstack/react-start` ^1.168.27      | Full-stack framework around Vite: routing, SSR, server functions.                         |
| `@tanstack/react-router` ^1.170.17     | Type-safe file-based routing.                                                            |
| `@tanstack/router-plugin` ^1.168.19    | Auto-generates the route tree (`src/routeTree.gen.ts`).                                  |
| `@tanstack/react-query` ^5.101.2       | Async state cache (available at the root).                                                |
| `react` / `react-dom` ^19.2.7          | Latest stable React.                                                                      |
| `typescript` ^5.9.3                    | Strict type safety.                                                                       |

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

## Build & Server

- **vite** `^8.1.3` powered by `@lovable.dev/vite-tanstack-config`
  `^2.7.2` (in `vite.config.ts`).
- **nitro** `3.0.260603-beta` — provides the HTTP server behind TanStack
  Start.

## Development Tooling

- **eslint** `^9.39.4` with `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `eslint-plugin-prettier`, `eslint-config-prettier`.
- **prettier** `^3.9.4`.
- **globals** `^15.15.0`, **@types/node** `^22.20.1`,
  `@types/react`, `@types/react-dom`.

## Testing

| Tool                | Version      | Role                                          |
| ------------------- | ------------ | --------------------------------------------- |
| `vitest`            | ^3.2.4       | Unit + integration runner                     |
| `@vitest/coverage-v8` | ^3.2.4    | Coverage                                      |
| `@vitest/browser`   | ^3.2.4       | Optional in-browser runner                    |
| `jsdom`             | ^25.0.1      | DOM emulation for Vitest                      |
| `@testing-library/react` | ^16.0.1 | Component testing                              |
| `@testing-library/jest-dom` | ^6.6.2 | Custom matchers                              |
| `@testing-library/user-event` | ^14.5.2 | Event simulation                              |
| `@playwright/test`  | ^1.48.0      | E2E browser testing                            |
| `axe-core`          | ^4.11.0      | Accessibility scans during E2E                 |
| `msw`               | ^2.7.0       | API mocking in unit / integration tests        |
| `@faker-js/faker`   | ^9.5.0       | Synthetic test data                            |

## Environment Variables

All variables live in `.env` and are typed in `src/lib/env.ts`.
See [`.env.example`](../.env.example) for the canonical list. Required
combinations:

| Variable                       | Notes                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`            | TMDb v3 API key (required together with the read token)                                |
| `VITE_TMDB_READ_ACCESS_TOKEN`  | Preferred for production TMDb requests (`Authorization: Bearer`)                      |
| `VITE_SPOTIFY_PLAYLIST_ID`     | Optional — gates the Spotify embed                                                     |
| `VITE_RESEND_API_KEY`          | Reserved for future email integration                                                  |
| `VITE_LOVE_LETTER_CATEGORY`    | `default` \| `birthday` \| `anniversary` \| `valentine` (defaults to `default`)        |

## Browser Support

Targets evergreen Chromium, Firefox, Safari and Edge. Features in use:

- ES modules
- CSS custom properties (`:root` variables, `oklch` colours)
- Fetch API + `Promise` + `async/await`
- `DeviceMotionEvent` (for the shake Easter egg)

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────┐
│ Browser                                                  │
│                                                          │
│  React 19  ←  Zustand store  ←  useUrlSync  ←  URL       │
│      │            │                  │                   │
│      ▼            ▼                  ▼                   │
│   UI components   localStorage      TanStack Router       │
│   (PageShell,                                         │  │
│    TopProgressBar,
//    BackgroundLayer)                                    │
└──────────────────────────────────────────────────────────┘
```

## Why This Stack?

- **TanStack Start** — a single, batteries-included framework with
  strong types through every layer.
- **Zustand + `useUrlSync`** — gives us persistent and shareable
  state without Redux or context boilerplate.
- **Tailwind v4** — fast iteration with first-class support for CSS
  variables, keyframes, and the design-system primitives in `styles.css`.
- **Vitest + Playwright + axe + MSW** — a comprehensive test pyramid
  without leaving JavaScript.
- **Vite** — the de facto fast build tool for modern web apps.

## Further Reading

- [package.json](../package.json) — exact pinned versions.
- [vite.config.ts](../vite.config.ts) and the
  [@lovable.dev/vite-tanstack-config](https://www.npmjs.com/package/@lovable.dev/vite-tanstack-config)
  preset.
