# Project Overview

## What is Datenight?

Datenight is a full-stack web application that turns planning a date night into
a guided, interactive experience. It walks users through a step-by-step flow —
from the playful "will you go out with me?" prompt to a final celebratory plan
— with smooth transitions, persistent state, URL synchronisation, and live data
from The Movie Database.

## User Flow

1. **Start Screen** ([`/`](../../src/routes/index.tsx)) — the playful
   yes / no question; **Yes** goes to confirmation, **No** plays a
   dodging-button begging page ([`/begging`](../../src/routes/begging.tsx)).
2. **Confirmation** ([`/confirmation`](../../src/routes/confirmation.tsx)) —
   celebration screen after "Yes" with confetti and a chime.
3. **Date** ([`/date`](../../src/routes/date.tsx)) — pick the day with a
   native date picker and quick-select chips (Today / Tomorrow / Day After /
   Next Week).
4. **Time** ([`/time`](../../src/routes/time.tsx)) — choose a quick time
   chip or use a native time input.
5. **Movie** ([`/movie`](../../src/routes/movie.tsx)) — debounced, live
   TMDb search backed by `src/lib/movies.ts`, with **recommended** and
   **classic** chips on each card.
6. **Love Letter** ([`/love-letter`](../../src/routes/love-letter.tsx)) —
   curate, shuffle, edit, or share-as-image the love letter.
7. **Summary** ([`/summary`](../../src/routes/summary.tsx)) — review card
   with the selected movie's backdrop, date / time / duration, countdown
   timer, share button and confirm CTA.
8. **Success** ([`/success`](../../src/routes/success.tsx)) — terminal
   celebration: timer, backdrop, glass-morphism panel and "Plan another
   date" reset.

> **Note**: Each route is reachable via the persistent top progress bar
> (see [`src/components/TopProgressBar.tsx`](../../src/components/TopProgressBar.tsx)).
> Forward-only steps are blocked until the user has reached them naturally.

## Key Features

- **Step-by-Step Wizard** — six numbered steps (Start → Celebrate) rendered
  by `TopProgressBar`; the URL is the source of truth.
- **Persistent Backgrounds** — `BackgroundContext` + `BackgroundLayer` +
  `BackgroundVariantSync` keep a single animated gradient alive across
  route changes (cross-faded variants).
- **Live TMDb Search** — `src/lib/movies.ts` performs live fetches with
  cached genres and a 7-day `localStorage` cache of curated picks.
- **Shareable Plans** — store ⇄ URL sync via `useUrlSync`; movies hydrate
  by ID on refresh / shared link.
- **Bottom Control Bar** — global dark / audio / love-letter shortcuts
  in [`BottomControlBar`](../../src/components/BottomControlBar.tsx).
- **Floating Decorations** — hearts / sparkles / pointer trails via
  [`FloatingDecorations`](../../src/components/FloatingDecorations.tsx).
- **Optional Background Audio** — `useBackgroundAudio` autoplays with a
  first-interaction fallback.
- **Optional Spotify Embed** — gated by `VITE_SPOTIFY_PLAYLIST_ID`.
- **Share-as-Image Love Card** — `/love-letter` exports a PNG via Canvas.
- **Persistent State** — Zustand store with `localStorage` persistence.
- **Type-Safe Routing** — TanStack Router file-based routes
  (`src/router.tsx`, generated `routeTree.gen.ts`).

## Design Philosophy

- **Delightful Interactions** — Framer Motion shapes every entrance,
  hover, and celebration.
- **Single-Source-of-Truth Routing** — URL drives the active step; the
  progress bar, header tags and animations read from `useLocation()`.
- **Server / Client Symmetry** — hydration-safe random logic in
  `useRandomMessage` and `ConfettiCelebration` keeps SSR and first render
  identical.
- **Accessibility** — keyboard-navigable focus rings, `aria-current`
  on the progress bar, `prefers-reduced-motion` respected via global
  CSS rules.
- **Performance** — Vite + React 19, code-split by route, persisted
  state restored synchronously through Zustand's `persist` middleware.

## Technology Highlights

| Area               | Technology                                                 |
| ------------------ | ---------------------------------------------------------- |
| Framework          | TanStack Start (React 19 + Vite 8)                         |
| Routing            | TanStack Router (file-based)                               |
| State Management   | Zustand + `localStorage` persist middleware                |
| URL Sync           | Custom `useUrlSync` hook                                   |
| Styling            | Tailwind CSS v4 (Vite plugin) + CSS vars                   |
| UI Primitives      | Radix UI + shadcn-style wrappers under `src/components/ui` |
| Animations         | Framer Motion (springs, `AnimatePresence`)                 |
| Icons              | Lucide React                                               |
| Movie Data         | TMDb v3 API                                                |
| Dates              | date-fns                                                   |
| Audio              | Web Audio API + optional `love.mp3`                        |
| Toasts             | Sonner                                                     |
| Linting / Format   | ESLint 9 + Prettier 3 + typescript-eslint                  |
| Unit / Integration | Vitest 3 + Testing Library + jsdom                         |
| E2E                | Playwright 1.48 (Chromium / Firefox / WebKit)              |
| API Mocking        | MSW                                                        |
| Accessibility      | axe-core                                                   |

## Boot Configuration

The repository ships with sensible defaults; runtime integration is
controlled by environment variables documented in
[`.env.example`](../../.env.example). See
[`src/lib/env.ts`](../../src/lib/env.ts) for the typed surface used
throughout the code.

## Getting Started

See [getting-started.md](getting-started.md).
