# State Management

Datenight uses [Zustand](https://zustand-demo.pmndrs.org/) for state and
[`useUrlSync`](https://github.com/your-username/datenight/blob/main/src/hooks/useUrlSync.ts)
to keep the store in lockstep with the URL.

## Overview

All date-plan state lives in a single Zustand store at
[`src/lib/store.ts`](../src/lib/store.ts). Selections are persisted to
`localStorage` (not `sessionStorage` — see the migration note below)
under the storage key `date-plan`. The URL sync layer keeps bookmarks,
deep links, and browser back / forward fully working.

### Why `localStorage` over `sessionStorage`?

Earlier revisions used `sessionStorage`, which made the plan disappear as
soon as the tab closed. `localStorage` was chosen so a date planned on
Monday survives until the user explicitly resets. The change happened
with the broader UI refresh in v1.5.

## Store Structure

### State Interface

```ts
interface DateState {
  // Core plan data
  date: string | null; // ISO yyyy-MM-dd
  time: string | null; // HH:mm (24-hour)
  movie: Movie | null; // Full TMDb object

  // UI preferences
  isDarkMode: boolean; // Persistent dark mode toggle
  isAudioEnabled: boolean; // Background audio toggle (UI + audio)
  loveMessage: string; // Custom love-letter text

  // Actions
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setMovie: (movie: Movie) => void;
  reset: () => void;

  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  toggleAudio: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setLoveMessage: (message: string) => void;
}
```

### Action Reference

| Action                     | Effect                                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| `setDate(date)`            | Updates the selected date                                                 |
| `setTime(time)`            | Updates the selected time                                                 |
| `setMovie(movie)`          | Updates the selected movie                                                |
| `reset()`                  | Clears date / time / movie / love message; **keeps** the audio preference |
| `toggleDarkMode()`         | Flips `isDarkMode`                                                        |
| `setDarkMode(isDark)`      | Sets `isDarkMode` to a specific value                                     |
| `toggleAudio()`            | Flips `isAudioEnabled`                                                    |
| `setAudioEnabled(enabled)` | Forces a specific audio state                                             |
| `setLoveMessage(message)`  | Updates the love-letter copy                                              |

## Persistence

The store uses `zustand/middleware/persist`:

```ts
persist((set, get) => ({/* state + actions */}), {
  name: "date-plan",
  storage: createJSONStorage(
    () => (typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage)), // SSR fallback
  ),
  partialize: (state) => ({
    date: state.date,
    time: state.time,
    movie: state.movie,
    isDarkMode: state.isDarkMode,
    isAudioEnabled: state.isAudioEnabled,
    loveMessage: state.loveMessage,
  }),
});
```

- All persisted fields are partialize'd; transient UI state stays out
  of storage.
- A server-side fallback (`undefined as unknown as Storage`) keeps SSR
  happy when `window` is unavailable.

## URL Synchronisation

[`src/hooks/useUrlSync.ts`](../src/hooks/useUrlSync.ts) is the single
source of truth for keeping the URL and the store in sync. Every form
step calls `syncState()` on mount and `syncUrl()` when its local state
changes.

### Hook API

```ts
import { useUrlSync } from "@/hooks/useUrlSync";

const { syncUrl, syncState, sync, getSearchParams } = useUrlSync();
```

| Method                 | Direction          | Notes                          |
| ---------------------- | ------------------ | ------------------------------ |
| `syncState()`          | URL → store        | Hydrate from search params     |
| `syncUrl()`            | Store → URL        | Replace, do not push           |
| `sync()`               | Both directions    | Reads URL, then writes URL     |
| `getSearchParams()`    | Store → params     | For ad-hoc read                |
| `createShareableUrl()` | Store → public URL | Used by the share button       |
| `getMovieIdFromUrl()`  | URL → number       | Used by `/movie` to re-hydrate |

### URL Parameter Mapping

| Store value   | URL parameter | Format          |
| ------------- | ------------- | --------------- |
| `date`        | `date`        | `yyyy-MM-dd`    |
| `time`        | `time`        | `HH:mm`         |
| `movie.id`    | `movie`       | Numeric TMDb ID |
| `loveMessage` | `love`        | URL-encoded     |
| `isDarkMode`  | `theme`       | `dark` if on    |

### Why a Custom Hook?

The older `syncUrlWithState` function in [`src/lib/storage.ts`](../src/lib/storage.ts)
called `window.history.replaceState()` directly — which TanStack Router
treats as out-of-band. The hook fixes that by:

- Routing everything through `navigate({ to: url, replace: true })`.
- Tracking in-flight updates via `useRef` to avoid redundant calls.
- Preserving non-managed query parameters (UTM tags, etc.).
- Using setter equality checks before writing back to avoid loops.

## Movie Type

The `Movie` interface is defined in
[`src/lib/movies.ts`](../src/lib/movies.ts):

```ts
interface Movie {
  id: string; // TMDb movie ID (stringified for URL)
  title: string;
  description: string; // Movie overview / plot summary
  poster_path: string | null; // TMDB CDN path
  backdrop_path: string | null;
  rating: number; // vote_average (0-10)
  tags: string[]; // Genre names
  year: number; // Release year
  duration: number; // Runtime in minutes
}
```

> Earlier versions of the project stored an `emoji` and a
> `posterGradient` placeholder; those have been removed in favour of
> authentic TMDb data + images.

## How Components Use the Store

Components subscribe through the `useDateStore` hook with selectors to
keep re-renders minimal:

```tsx
const isDarkMode = useDateStore((s) => s.isDarkMode);
const toggleDarkMode = useDateStore((s) => s.toggleDarkMode);
```

Non-reactive reads use `getState()`:

```ts
const url = createShareableUrl();
```

## Data Flow Example

| Screen     | Action                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| `/date`    | User picks a date → `setDate()` → `syncUrl()` updates the URL                        |
| `/time`    | `syncState()` hydrates → user picks → `setTime()` → `syncUrl()`                      |
| `/movie`   | `syncState()` hydrates → user picks → `setMovie()` → `syncUrl()`                     |
| `/summary` | Reads everything from the store; if anything is missing → guard navigates to `/date` |
| `/success` | "Plan another date" → `reset()` → `navigate('/')`                                    |

## Movie Recommendations Caching

`fetchOriginalRecommendations()` in `src/lib/movies.ts` caches the
curated set in `localStorage` for 7 days. The key is
`curatedRecommendations` and stores `{ timestamp, data }`. Bump the
TTL there if you want to refresh picks on a different cadence.

## Background Audio & Dark Mode

- `useBackgroundAudio` in
  [`src/hooks/useBackgroundAudio.ts`](../src/hooks/useBackgroundAudio.ts)
  owns the single `<audio>` element; it starts paused or playing
  based on `isAudioEnabled`.
- `src/routes/__root.tsx` mirrors `isDarkMode` to the `<html>` class
  so the global CSS variables in `src/styles.css` take effect.

## Resetting the Plan

`reset()` clears date / time / movie and resets the love message to the
default copy. It deliberately keeps `isAudioEnabled` — toggling the
mute preference through "Plan another date" is jarring.

## Extending the Store

1. Add the new field to `DateState` in [`src/lib/store.ts`](../src/lib/store.ts).
2. Provide an initial value in `set` and a setter.
3. Add the field to `partialize` if it should persist.
4. Add the field to the URL-sync mapping in
   [`useUrlSync.ts`](../src/hooks/useUrlSync.ts).
5. Add tests in `tests/unit/lib/store.test.ts`.

## Testing

The store is exercised by `tests/unit/lib/store.test.ts` and
`tests/unit/hooks/useUrlSync.test.ts`. Sample setup:

```ts
import { useDateStore } from "@/lib/store";

beforeEach(() => useDateStore.getState().reset());

it("stores a date", () => {
  useDateStore.getState().setDate("2026-08-01");
  expect(useDateStore.getState().date).toBe("2026-08-01");
});

it("reset clears the plan but keeps audio", () => {
  useDateStore.getState().setDate("2026-08-01");
  useDateStore.getState().toggleAudio();
  const { isAudioEnabled } = useDateStore.getState();
  useDateStore.getState().reset();
  expect(useDateStore.getState().date).toBeNull();
  expect(useDateStore.getState().isAudioEnabled).toBe(isAudioEnabled);
});
```

## Things to Watch Out For

- **Hydration mismatch** — Zustand's `persist` middleware is synchronous
  on the client; always gate time-dependent UI behind a `useEffect`.
- **Memory stickiness** — because we now use `localStorage`, calls to
  `setMovie()` should be paired with `syncUrl()` so deep links match
  the latest pick.
- **SSR safety** — `useUrlSync` already guards `typeof window`; never
  read `window.location` outside of `useEffect`.

## Further Reading

- [Zustand Persist Middleware](https://github.com/pmndrs/zustand/blob/master/docs/middleware/persist.md)
- [TanStack Router Navigation](https://tanstack.com/router/latest)
- [Custom `useUrlSync`](../src/hooks/useUrlSync.ts)
