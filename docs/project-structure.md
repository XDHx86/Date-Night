# Project Structure

A map of the `src/` tree describing each file's purpose. The codebase
is small enough to read top-to-bottom — start from here when onboarding.

## Tree

```
datenight/
├── index.html                    # Static SPA shell (full <head>, mount point, script)
├── src/
│   ├── main.tsx                  # SPA bootstrap — creates root, mounts <RouterProvider/>
│   ├── assets/                   # Static images (landing, begging, celebration, final)
│   ├── audio/                    # Optional background music (love.mp3) — public path
│   ├── components/               # Presentational + persistent UI
│   │   ├── ui/                   # Radix-based shadcn-style primitives
│   │   ├── AnimatedBackground.tsx
│   │   ├── AnimatedButton.tsx
│   │   ├── BackgroundContext.tsx
│   │   ├── BackgroundLayer.tsx
│   │   ├── BackgroundVariantSync.tsx
│   │   ├── BottomControlBar.tsx
│   │   ├── ConfettiCelebration.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── FloatingBackground.tsx
│   │   ├── FloatingDecorations.tsx
│   │   ├── HeartBurst.tsx
│   │   ├── HeartExplosion.tsx
│   │   ├── MovieBackdropBackground.tsx
│   │   ├── MovieCard.tsx
│   │   ├── MoviePoster.tsx
│   │   ├── PageShell.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── SoundToggle.tsx
│   │   ├── SparkleTrail.tsx
│   │   ├── SpotifyEmbed.tsx
│   │   └── TopProgressBar.tsx
│   ├── data/                     # Static data: curatedMovies, loveLetters
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── useBackgroundAudio.ts
│   │   ├── useRandomMessage.ts
│   │   ├── useRouteStep.ts
│   │   ├── useShakeEffect.ts
│   │   └── useUrlSync.ts
│   ├── lib/                      # Core application logic
│   │   ├── env.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── loveLetterConfig.ts
│   │   ├── lovable-error-reporting.ts
│   │   ├── messages.ts
│   │   ├── movies.ts
│   │   ├── sound.ts
│   │   ├── store.ts              # Zustand store (persisted)
│   │   ├── tmdbImages.ts
│   │   └── utils.ts
│   ├── routes/                   # File-based routes (auto router)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── begging.tsx
│   │   ├── confirmation.tsx
│   │   ├── date.tsx
│   │   ├── time.tsx
│   │   ├── movie.tsx
│   │   ├── love-letter.tsx
│   │   ├── summary.tsx
│   │   └── success.tsx
│   ├── router.tsx                # router configuration
│   ├── routeTree.gen.ts          # ⚙ auto-generated. Don't edit.
│   └── styles.css                # Tailwind v4 + CSS variables
├── public/                       # Copied verbatim into dist/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml               # Static sitemap served at /sitemap.xml
├── scripts/
│   └── copy-404.cjs              # Post-build: dist/index.html → dist/404.html (SPA fallback)
├── tests/
├── docs/                         # This folder
├── .github/                      # Workflows + Dependabot
└── playwright.config.ts
```

## Components

### Animation & Motion

- `AnimatedButton` — framer-motion button with five variants
  (`yes`, `no`, `gold`, `soft`, `ghost`).
- `PageShell` — shared layout with fade/slide entrance; backgrounds and
  particles live at the root.
- `AnimatedBackground` — gradient-shift panel with per-variant
  gradients; retained for back-compat.
- `BackgroundContext`, `BackgroundLayer`, `BackgroundVariantSync` —
  persistent, URL-aware gradient background.
- `ConfettiCelebration` — physics-based confetti using framer-motion
  springs; deterministic on first render.
- `HeartBurst`, `HeartExplosion` — celebratory particle bursts.
- `SparkleTrail` — pointer / touch sparkle trail.
- `FloatingBackground`, `FloatingDecorations` — gentle floating hearts +
  sparkles that stay mounted across route changes.

### Persistent Layout

- `TopProgressBar` — root-level progress with URL-driven step
  derivation; locks navigation on `/success`.
- `BottomControlBar` — dark mode, audio, love-letter shortcuts.
- `MovieBackdropBackground`, `MoviePoster` — movie artwork driven by
  TMDB image URLs (`src/lib/tmdbImages.ts`).
- `MovieCard` — title / rating / tags / year / duration with category
  badges.

### Media / Integrations

- `SpotifyEmbed` — only renders if `VITE_SPOTIFY_PLAYLIST_ID` is set.
- `SoundToggle` — floating speaker toggle for the synthesised SFX
  (still present; the bottom bar's volume button also works).
- `CountdownTimer` — computes days / hours / minutes / seconds to a
  given ISO datetime.

### UI Primitives

`src/components/ui/` ships the Radix-based shadcn-style primitives —
accordion, alert, button, card, dialog, dropdown-menu, input, sheet,
sidebar, sonner, switch, table, tabs, textarea, toggle, tooltip, etc.

## Hooks

| Hook                                 | Purpose                                                     |
| ------------------------------------ | ----------------------------------------------------------- |
| `use-mobile.tsx`                     | Responsive breakpoint helper used by the shadcn sidebar     |
| `useBackgroundAudio(options?)`       | Autoplay + first-interaction fallback audio engine          |
| `useRandomMessage(category)`         | Deterministic-on-first-render, random-after-mount copy      |
| `useRouteStep(totalSteps?)`          | URL → step / progress data                                  |
| `useShakeEffect(callback, options?)` | Device-motion shake → callback (threshold `25`)             |
| `useUrlSync()`                       | Bidirectional URL ⇄ Zustand sync plus share/hydrate helpers |

## Lib

- `env.ts` — typed wrapper around `import.meta.env`.
- `store.ts` — Zustand store (Zustand + `persist` to `localStorage`).
- `movies.ts` — TMDb client: `searchMovies`, `getMovieById`,
  `fetchOriginalRecommendations`, in-memory genre cache.
- `tmdbImages.ts` — `tmdbImage`, `backdropUrl`, `posterUrl`,
  `FALLBACK_POSTER`.
- `loveLetterConfig.ts` — picks the active love-letter category.
- `sound.ts` — Web Audio SFX.
- `messages.ts` — playful copy collections.
- `utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `error-capture.ts`, `lovable-error-reporting.ts`, `error-page.ts` —
  client error pipeline wired to the root error component.

## Data

- `data/curatedMovies.ts` — curated TMDB IDs used for the initial
  recommendations.
- `data/loveLetters.ts` — letter templates by category (default /
  birthday / anniversary / valentine).

## Routes

Each route is a thin page that wires the store, `useUrlSync`, and a
small custom component. See [routing.md](routing.md) for the full table.

## Tests

See [testing.md](testing.md) for layout, conventions and tool links.

## Adding a New Feature

1. **Component / hook / lib** — drop the file into its corresponding
   folder and export it.
2. **New page** — create a file under `src/routes/`, export
   `Route = createFileRoute('/your-path')({ component: YourPage })`,
   then `npm run dev` to regenerate the route tree.
3. **New state slice** — add the field to `store.ts`, register it with
   `partialize`, and update `useUrlSync`.
4. **New persistent decoration** — mount it once in
   `src/routes/__root.tsx`; never re-create on navigation.
5. **New background variant** — extend the `BackgroundVariant` type
   in `BackgroundContext.tsx` and the `ROUTE_VARIANT` map in
   `BackgroundVariantSync.tsx`.

## Finding Things Quickly

| What are you looking for? | Look in                                               |
| ------------------------- | ----------------------------------------------------- |
| The state shape           | `src/lib/store.ts`                                    |
| TMDb integration          | `src/lib/movies.ts` + `src/lib/tmdbImages.ts`         |
| Love-letter content       | `src/data/loveLetters.ts`                             |
| Routing table             | `src/router.tsx`, `src/routeTree.gen.ts`              |
| Cross-cutting decoration  | `src/routes/__root.tsx`                               |
| Per-step behaviour        | `src/routes/`                                         |
| Test helpers              | `tests/utils/`, `tests/factories/`, `tests/fixtures/` |
| Build configuration       | `vite.config.ts`                                      |
| SPA-shell HTML            | `index.html`                                          |
| SPA fallback              | `scripts/copy-404.cjs`                                |
