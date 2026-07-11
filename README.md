# Datenight 2

A playful, interactive date-night planner built with TanStack Start, React, and modern web technologies.

## Overview

Datenight guides users through planning a perfect date night step-by-step:
1. Ask a fun yes/no question to start
2. Pick a date for your outing
3. Select a time of day
4. Choose a movie to watch together (with real TMDb integration)
5. Review your selections
6. Celebrate your completed plan!

The app features engaging animations, persistent state storage, URL synchronization, and a delightful user experience.

## Documentation

Detailed documentation is available in the [`/docs`](./docs) directory:

- [Overview](./docs/overview.md) - Project purpose and features
- [Technology Stack](./docs/tech-stack.md) - Detailed breakdown of dependencies
- [Getting Started](./docs/getting-started.md) - Installation and setup guide
- [Project Structure](./docs/project-structure.md) - Code organization explained
- [Routing System](./docs/routing.md) - File-based routing with TanStack Router
- [State Management](./docs/state-management.md) - Zustand store implementation and URL sync
- [Features](./docs/features.md) - Walkthrough of each step in the user flow
- [Contributing](./docs/contributing.md) - How to contribute to the project
- [FAQ](./docs/faq.md) - Frequently asked questions

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/datenight.git
cd datenight

# Install dependencies (using bun recommended)
bun install

# Start the development server
bun run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173) by default.

## Recent Changes

### Navigation & URL Synchronization Fix (July 2026)

**Problem:** Navigation between routes (`/date`, `/time`, `/movie`) was unreliable - clicking "Next" would update the URL but not the displayed page.

**Root Causes:**
1. `window.history.replaceState()` in `syncUrlWithState` conflicted with TanStack Router's internal state management
2. Duplicate URL synchronization logic across multiple route components with stale closures
3. Render-time side effects (navigation calls during render in `time.tsx` and `movie.tsx`)
4. Direct `window.history.back()` usage in `love-letter.tsx`

**Solution:**
- Created new centralized `useUrlSync` hook (`src/hooks/useUrlSync.ts`) that uses TanStack Router's `navigate()` API
- Moved all navigation calls into `useEffect` hooks to avoid render-time side effects
- Replaced `window.history.back()` with `navigate({ to: -1 })`
- Deprecated old `syncUrlWithState` function in `storage.ts`

**Files Changed:**
- `src/hooks/useUrlSync.ts` (NEW) - Centralized URL synchronization
- `src/lib/storage.ts` - Deprecated old sync function
- `src/routes/date.tsx` - Use new hook, fix render-time effects
- `src/routes/time.tsx` - Use new hook, move guard to useEffect
- `src/routes/movie.tsx` - Use new hook, fix guard timing
- `src/routes/love-letter.tsx` - Replace window.history with router API

**Result:** ✅ Navigation now works reliably on first click, URL search params stay in sync, browser back/forward works correctly.

### TMDb Integration (July 2026)

**Status:** Fully implemented with live TMDb API data

**Changes:**
- All hardcoded/placeholder movie data replaced with live TMDb API calls
- Movie cards display real posters, backdrops, ratings, genres, and durations
- Search limited to 6 results for optimal UX
- Success page uses selected movie's poster as full-screen background
- Genre caching to minimize API calls

**Files Changed:**
- `src/lib/movies.ts` - Full TMDb integration
- `src/routes/movie.tsx` - Live search with recommendations
- `src/components/MovieCard.tsx` - Real movie data display
- `src/routes/summary.tsx` - Duration display
- `src/routes/success.tsx` - Poster background

See [missing.md](./missing.md) for complete TMDb implementation details.

## Project Health

| Aspect | Status |
|--------|--------|
| Build | ✅ Passing |
| Lint | ✅ Passing |
| TypeScript | ✅ No errors |
| Navigation | ✅ Fixed |
| URL Sync | ✅ Fixed |
| TMDb Integration | ✅ Complete |

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details on our code of conduct, development process, and coding standards.

## License

This project is licensed under the MIT License - see the [LICENSE](./license) file for details.

---

*Last updated: July 11, 2026*
