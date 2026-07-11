# Changelog

All notable changes to the Datenight project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `CHANGELOG.md` - This file, to track all project changes going forward

---

## [1.2.0] - 2026-07-11

### Fixed
- **Critical navigation bug** where clicking "Next" would update the URL but not change the displayed page
- **URL synchronization** now works reliably across all routes
- **Browser back/forward navigation** now works correctly
- **Page refresh** now properly restores state from URL
- **Render-time side effects** eliminated in `time.tsx` and `movie.tsx`

### Added
- **New `useUrlSync` hook** (`src/hooks/useUrlSync.ts`) - Centralized URL synchronization using TanStack Router's API
  - `syncUrl()` - Sync URL from Zustand state
  - `syncState()` - Sync Zustand state from URL
  - `sync()` - Full bidirectional sync
  - `getSearchParams()` - Get current state as URLSearchParams
- **URL parameter synchronization** for all state properties:
  - `date` → `?date=yyyy-MM-dd`
  - `time` → `?time=HH:mm`
  - `movie` → `?movie=<id>`
  - `loveMessage` → `?love=<message>`
  - `isDarkMode` → `?theme=dark`

### Changed
- **`src/routes/date.tsx`** - Migrated to `useUrlSync` hook, fixed render-time side effects
- **`src/routes/time.tsx`** - Migrated to `useUrlSync` hook, moved guard navigation to `useEffect`
- **`src/routes/movie.tsx`** - Migrated to `useUrlSync` hook, moved guard navigation to `useEffect`
- **`src/routes/love-letter.tsx`** - Migrated to `useUrlSync` hook, replaced `window.history.back()` with `navigate({ to: -1 })`
- **`src/lib/storage.ts`** - Deprecated `syncUrlWithState` function with warning messages

### Deprecated
- `syncUrlWithState()` from `src/lib/storage.ts` - Use `useUrlSync` hook instead
- Direct `window.history.pushState/replaceState` usage - Use `navigate()` from `@tanstack/react-router`

### Technical Details
- **Root Cause**: `window.history.replaceState()` conflicted with TanStack Router's internal state management
- **Solution**: Use router's `navigate({ to: url, replace: true })` API instead
- **Race Conditions**: Eliminated by using `useEffect` for all navigation and sync operations
- **Stale Closures**: Fixed by consolidating sync logic into single hook instance

---

## [1.1.0] - 2026-07-10

### Added
- **Full TMDb API integration** - All movie data now fetched from The Movie Database
- **`src/lib/tmdbImages.ts`** - Utility for building TMDb image URLs
- **`src/lib/loveLetterConfig.ts`** - Configuration for love letter categories
- **`src/data/`** directory - Love letter templates organized by category
- **New components**:
  - `BackgroundContext.tsx` - Background variant management
  - `BackgroundLayer.tsx` - Background rendering layer
  - `BackgroundVariantSync.tsx` - Syncs background with routes
  - `BottomControlBar.tsx` - Persistent bottom navigation controls
  - `ConfettiCelebration.tsx` - Confetti animation effect
  - `FloatingDecorations.tsx` - Floating decorative elements
  - `HeartExplosion.tsx` - Heart particle explosion effect
  - `MovieBackdropBackground.tsx` - Movie backdrop as page background
  - `MoviePoster.tsx` - Movie poster display component
  - `TopProgressBar.tsx` - Persistent progress indicator

### Changed
- **`src/lib/movies.ts`** - Complete refactor for TMDb integration:
  - Removed all hardcoded movie data
  - Added `fetchMoviesFromTmdb()` - Fetches movies from TMDb API
  - Added `getMovieById()` - Fetches single movie details
  - Added `searchMovies()` - Searches TMDb with query
  - Added `fetchOriginalRecommendations()` - Gets popular movies
  - Added genre mapping and caching
  - Normalized Movie interface to use TMDb fields
- **`src/routes/movie.tsx`** - Updated for TMDb integration:
  - Loads initial recommendations on mount
  - Real-time search with debouncing
  - Restores selections from URL
- **`src/components/MovieCard.tsx`** - Updated to use TMDb data:
  - Displays real poster images from TMDb
  - Shows actual movie metadata (rating, duration, genres)
  - Fallback gradients for missing posters
- **`src/routes/summary.tsx`** - Added duration display
- **`src/routes/success.tsx`** - Added movie poster background
- **`src/components/AnimatedButton.tsx`** - Additional variants and styling
- **`src/components/PageShell.tsx`** - Updated for new features
- **`src/hooks/useRouteStep.ts`** - New hook for progress bar step management
- **`src/hooks/useBackgroundAudio.ts`** - Audio management hook
- **`src/hooks/useUrlSync.ts`** - Initial version ( superfed by v1.2.0)

### Fixed
- Movie search now returns real results from TMDb
- Movie cards display accurate information (duration, genres, ratings)
- Poster images load from TMDb CDN
- Success page has visual movie backdrop

---

## [1.0.0] - 2026-07-01

### Added
- Initial project setup with TanStack Start
- Core routing structure (`/`, `/begging`, `/confirmation`, `/date`, `/time`, `/movie`, `/summary`, `/success`)
- Zustand store for state management
- Curated list of movies in `src/lib/movies.ts`
- Basic movie selection UI
- Date and time pickers
- Progress bar component
- Animated buttons and transitions
- Sound effects system
- Heart explosion celebration animation
- Confetti effects
- Dark mode support
- Responsive design
- SessionStorage persistence

### Project Structure
```
src/
├── assets/           # Static images (begging.jpg, celebration.jpg, landing.jpg)
├── components/       # Reusable UI components
│   ├── AnimatedBackground.tsx
│   ├── AnimatedButton.tsx
│   ├── CountdownTimer.tsx
│   ├── FloatingBackground.tsx
│   ├── HeartBurst.tsx
│   ├── MovieCard.tsx
│   ├── PageShell.tsx
│   ├── ProgressIndicator.tsx
│   ├── SpotifyEmbed.tsx
│   └── ui/
│       └── sidebar.tsx
├── hooks/            # Custom React hooks
│   ├── useRandomMessage.ts
│   └── useShakeEffect.ts
├── lib/              # Core logic
│   ├── messages.ts
│   ├── movies.ts
│   ├── sound.ts
│   └── store.ts
├── routes/           # Application pages
│   ├── __root.tsx
│   ├── begging.tsx
│   ├── confirmation.tsx
│   ├── date.tsx
│   ├── index.tsx
│   ├── movie.tsx
│   ├── summary.tsx
│   └── success.tsx
├── router.tsx
├── server.ts
├── start.ts
└── styles.css
```

---

## [0.1.0] - 2026-06-25

### Added
- Project created with Lovable.dev template
- Basic TanStack Start configuration
- Initial commit with template structure

---

[Unreleased]: https://github.com/your-username/datenight/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/your-username/datenight/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/your-username/datenight/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/your-username/datenight/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/your-username/datenight/releases/tag/v0.1.0

---

*Changelog started: July 11, 2026*
*Previous changes may not be fully documented*
