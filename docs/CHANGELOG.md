# Changelog

All notable changes to the Datenight project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Documentation refresh aligning every guide with the current codebase (route set,
  state management, TMDb integration, persistent background system, love-letter
  categories, Playwright config, CI workflows).

### Changed

- `README.md` rewritten with verified environment variables, scripts, project
  structure and recent highlights.
- `docs/overview.md`, `docs/routing.md`, `docs/state-management.md`,
  `docs/features.md`, `docs/project-structure.md`, `docs/tech-stack.md`,
  `docs/getting-started.md`, `docs/testing.md`, `docs/ci-cd.md`,
  `docs/contributing.md`, `docs/faq.md`, and `docs/missing.md` rewritten to
  reflect the actual files in the repository.
- `.env.example` updated — `VITE_RESEND_API_KEY` is now documented as reserved,
  and `VITE_LOVE_LETTER_CATEGORY` is described alongside its allowed values.

## [1.5.0] - 2026-07-12

### Added

- Centralised background system:
  - `src/components/BackgroundContext.tsx` — variant context
  - `src/components/BackgroundLayer.tsx` — single rendered layer with cross-fade
  - `src/components/BackgroundVariantSync.tsx` — URL → variant sync
- Persistent progress bar:
  - `src/components/TopProgressBar.tsx` — root-level progress with locking
  - `src/hooks/useRouteStep.ts` — URL-driven step derivation
- Bottom control bar:
  - `src/components/BottomControlBar.tsx` — combines dark / audio / love-letter
- Floating decorations layer:
  - `src/components/FloatingDecorations.tsx` (combines `FloatingBackground` +
    `SparkleTrail`).
  - `src/components/SparkleTrail.tsx` — pointer / touch sparkle trail.
  - `src/components/SoundToggle.tsx` — floating speaker toggle.
  - `src/components/HeartExplosion.tsx` — full-screen heart particle explosion.
- TMDb integration:
  - `src/lib/tmdbImages.ts` — shared URL builders and fallback image.
  - `src/lib/movies.ts` rewritten as a live TMDb client
    (`searchMovies`, `getMovieById`, `fetchOriginalRecommendations`,
    in-memory genre caching, `localStorage` caching of curated picks).
  - `src/data/curatedMovies.ts` — explicit IDs marked as recommendations.
- Love-letter system:
  - `src/data/loveLetters.ts` — categorised letter templates
    (`default`, `birthday`, `anniversary`, `valentine`).
  - `src/lib/loveLetterConfig.ts` — env-driven category picker.
  - `/love-letter` route with curate / shuffle / edit / share-as-image flows.
- `src/hooks/useBackgroundAudio.ts` — autoplay + interaction-fallback audio.
- `src/components/MovieBackdropBackground.tsx` /
  `src/components/MoviePoster.tsx` — backdrop & poster visuals backed by
  `tmdbImages`.
- `src/routes/sitemap[.]xml.ts` — sitemap endpoint.
- `src/components/MovieCard.tsx` — `Recommended` / `Classic` category badges.

### Changed

- `src/components/PageShell.tsx` — drops the per-route background / particle
  responsibilities in favour of the global BackgroundLayer + BottomControlBar.
- `src/components/AnimatedBackground.tsx` — variant props retained but the
  component is no longer the primary background source (kept for back-compat).
- `src/components/CountdownTimer.tsx` — combines date + time into a single
  ISO datetime string; now used by `/summary` and `/success`.
- `src/lib/store.ts` — switched persistence from `sessionStorage` to
  `localStorage`; added a richer state shape
  (`isDarkMode`, `isAudioEnabled`, `loveMessage`).
- `src/hooks/useShakeEffect.ts` — lowered threshold to `25` (was `20`) to
  reduce false positives on devices.
- `src/hooks/useRandomMessage.ts` — hydration-safe variant: returns
  `pool[0]` SSR / first render and re-rolls in `useEffect`.
- `src/routes/__root.tsx` — wires the new Background / Floating / Progress /
  BottomControl / Shake-Easter-egg stack.
- `src/routes/movie.tsx`, `summary.tsx`, `success.tsx` — adopt TMDb data,
  movie backdrop background, share controls and countdown.
- `src/styles.css` — dark mode via `.dark` class on `<html>`, with explicit
  transition definitions for every colour variable.
- `vite.config.ts` simplified — TanStack/Vite defaults via
  `@lovable.dev/vite-tanstack-config`.

## [1.4.0] - 2026-07-11 — Navigation & URL Sync Fixes

### Fixed

- `window.history` calls bypassed TanStack Router's internal state — replaced
  by `navigate()` everywhere (`src/routes/date.tsx`, `time.tsx`, `movie.tsx`,
  `love-letter.tsx`).
- Render-time navigation closures removed in favour of `useEffect`-driven guards.
- Page refresh no longer loses state — URL search params hydrate the store.

### Added

- `src/hooks/useUrlSync.ts` — single source of truth for URL ⇄ store sync.
- `syncUrl` / `syncState` utilities used by every form-style step.
- `createShareableUrl` / `getMovieIdFromUrl` helpers for share buttons.

## [1.3.0] - 2026-07-11 — TMDb Integration

### Added

- Live TMDb API integration (`src/lib/movies.ts`) for search and detail fetches.
- Real poster / backdrop images via `src/components/MovieCard.tsx` and
  `src/components/MovieBackdropBackground.tsx`.
- Genre-aware search (limited to 6 results per query).

## [1.2.0] - 2026-07-10 — Love Letter, Shareable Links, Tests

### Added

- `/love-letter` route with template + custom edit + share-as-image.
- Shareable URL with date / time / movie / love-message / theme.
- Audio toggle (WebAudio synthesised blips + optional `love.mp3` background).
- Optional Spotify embed on `/summary` and `/success`.
- Curated movie list retry on TMDb failure.
- Initial Vitest suite under `tests/unit/lib` and `tests/unit/hooks`.
- Initial Playwright E2E suite in `tests/e2e`.

### Fixed

- `bg-muted` selector in `tests/e2e/setup.ts` for axe.
- `curl-style` TMDB request failures surface as friendly toasts, not crashes.

## [1.1.0] - 2026-07-09 — Polished UI, Random Messages, Confetti

### Added

- `src/lib/messages.ts` with eight categories of playful copy.
- `src/hooks/useRandomMessage.ts` for per-screen copy.
- `src/components/ConfettiCelebration.tsx` (framer-motion springs).
- `src/components/HeartBurst.tsx`, `src/components/CountdownTimer.tsx`.
- `src/components/AnimatedBackground.tsx` for gradient-shift panel.
- `src/components/AnimatedButton.tsx` (variants: `yes`, `no`, `gold`,
  `soft`, `ghost`).

## [1.0.0] - 2026-07-01

### Added

- Initial TanStack Start project.
- Routing via TanStack Router with file-based routes.
- Zustand store with `sessionStorage` persistence.
- Routes: `/`, `/begging`, `/confirmation`, `/date`, `/time`, `/movie`,
  `/summary`, `/success`.
- Curated movie list (mock data) in `src/lib/movies.ts`.
- Sound effects system (`src/lib/sound.ts`).
- Dark mode scaffold.

## [0.1.0] - 2026-06-25

- Initial scaffold from the Lovable.dev TanStack Start template.

[Unreleased]: https://github.com/your-username/datenight/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/your-username/datenight/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/your-username/datenight/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/your-username/datenight/compare/v1.2.0...v1.2.0
[1.2.0]: https://github.com/your-username/datenight/compare/v1.1.0...v1.1.0
[1.1.0]: https://github.com/your-username/datenight/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-username/datenight/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/your-username/datenight/releases/tag/v0.1.0

---

_Changelog started: July 1, 2026._
