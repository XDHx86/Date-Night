# State Management

Datenight uses [Zustand](https://zustand-demo.pmndrs.org/) for state management, chosen for its simplicity, minimal boilerplate, and excellent TypeScript integration. The application state is centered around the user's date night selections: date, time, movie, and UI preferences.

## Overview

The state is managed through a single store located at `src/lib/store.ts`. This store persists selections to `sessionStorage` so that users can refresh the page or temporarily leave the site without losing their progress.

Additionally, a **URL synchronization layer** (introduced in July 2026) keeps the Zustand store in sync with URL search parameters, enabling:
- Bookmarking any step in the flow
- Sharing date plans via URL
- Browser back/forward navigation
- State restoration on page refresh

## Store Structure

### State Interface

The store manages the following pieces of data:

```typescript
interface DateState {
  // Core date plan data
  date: string | null; // ISO format date string (yyyy-MM-dd)
  time: string | null; // 24-hour format time string (HH:mm)
  movie: Movie | null; // Selected movie object
  
  // UI preferences
  isDarkMode: boolean; // Dark/night mode preference
  isAudioEnabled: boolean; // Background audio preference
  loveMessage: string; // Custom love message for the love letter page
  
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

### State Values

- **date**: The selected date in ISO format (e.g., "2026-07-15"). `null` if no date has been chosen.
- **time**: The selected time in 24-hour format (e.g., "19:30"). `null` if no time has been selected.
- **movie**: The selected movie object from TMDb (see [Movie Type](#movie-type) below). `null` if no movie has been selected.
- **isDarkMode**: Toggle for dark/night mode theme.
- **isAudioEnabled**: Toggle for background audio.
- **loveMessage**: Custom message for the love letter page.

### Actions

The store provides setter functions to update each piece of state:

- `setDate(date: string)`: Updates the date value
- `setTime(time: string)`: Updates the time value
- `setMovie(movie: Movie)`: Updates the movie selection
- `reset()`: Clears all selections (date, time, movie) back to `null` (preserves audio preference)
- `toggleDarkMode()`: Toggles dark mode on/off
- `setDarkMode(isDark: boolean)`: Sets dark mode to specific value
- `toggleAudio()`: Toggles audio on/off
- `setAudioEnabled(enabled: boolean)`: Sets audio to specific value
- `setLoveMessage(message: string)`: Updates the love message

## Persistence

The store uses [Zustand's persist middleware](https://github.com/pmndrs/zustand/blob/master/docs/middleware/persist.md) to save state to `sessionStorage` under the key `"date-plan"`.

Key aspects of the persistence implementation:

```javascript
persist(
  (set) => ({ /* state and actions */ }),
  {
    name: "date-plan", // Storage key
    storage: createJSONStorage(() =>
      typeof window !== "undefined"
        ? window.sessionStorage
        : (undefined as unknown as Storage) // Fallback for SSR
    ),
    partialize: (state) => ({
      date: state.date,
      time: state.time,
      movie: state.movie,
      isDarkMode: state.isDarkMode,
      isAudioEnabled: state.isAudioEnabled,
      loveMessage: state.loveMessage,
    }),
  }
);
```

- **Why sessionStorage?**: Chosen over `localStorage` because date plans are typically short-lived - relevant only for the current browsing session or day.
- **Server-Side Rendering compatibility**: The storage check ensures the code works during SSR (when `window` is undefined) by falling back to an in-memory store.
- **Automatic hydration**: On page load, the store automatically retrieves and restores any saved state from `sessionStorage`.

## URL Synchronization

**NEW in July 2026**: The application now synchronizes state with URL search parameters using a centralized hook.

### The `useUrlSync` Hook

Located at `src/hooks/useUrlSync.ts`, this hook provides a single source of truth for URL synchronization:

```typescript
import { useUrlSync } from '@/hooks/useUrlSync';

const { syncUrl, syncState, sync, getSearchParams } = useUrlSync();
```

#### Methods

| Method | Description | Direction |
|--------|-------------|-----------|
| `syncUrl()` | Sync URL from current Zustand state | State → URL |
| `syncState()` | Sync Zustand state from URL | URL → State |
| `sync()` | Full sync in both directions | Bidirectional |
| `getSearchParams()` | Get current state as URLSearchParams | State → Params |

#### URL Parameter Mapping

| Zustand State | URL Parameter | Format |
|----------------|---------------|--------|
| `date` | `date` | ISO format (yyyy-MM-dd) |
| `time` | `time` | 24-hour format (HH:mm) |
| `movie` | `movie` | Movie ID (number) |
| `loveMessage` | `love` | URL-encoded string |
| `isDarkMode` | `theme` | "dark" or omitted |

#### Usage Pattern

```typescript
function MyRouteComponent() {
  const { syncUrl, syncState } = useUrlSync();
  const { date, setDate } = useDateStore();

  // Hydrate from URL on mount
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Sync to URL when state changes
  useEffect(() => {
    syncUrl();
  }, [date, time, movie, loveMessage, isDarkMode, syncUrl]);

  // Update state and let useEffect handle URL sync
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    // syncUrl() will be called automatically by the useEffect above
  };
}
```

### How It Works

1. **State → URL**: When Zustand state changes, `syncUrl()` builds a new URL with updated search parameters and uses `navigate({ to: newUrl, replace: true })` to update the URL without adding a new history entry.

2. **URL → State**: When the route mounts or the URL changes, `syncState()` parses the URL search parameters and calls the appropriate Zustand setters to update the store.

3. **Bidirectional Sync**: The `sync()` method combines both directions to ensure consistency.

### Why This Approach?

- **No direct `window.history` manipulation**: Uses TanStack Router's `navigate()` API, which keeps the router's internal state in sync.
- **Single source of truth**: All URL sync logic is centralized, preventing duplicate/conflicting updates.
- **Race condition prevention**: Uses a ref to track pending updates and skip redundant calls.
- **Preserves non-managed params**: Any existing query parameters (like UTM tags) are preserved during sync.

### Migration from Old Approach

The old `syncUrlWithState` function in `src/lib/storage.ts` is now **deprecated**. It directly manipulated `window.history.replaceState()`, which conflicted with TanStack Router's internal state management.

> **⚠️ Warning**: If you see `syncUrlWithState` being used in the codebase, it should be replaced with `useUrlSync`. A console warning is logged when the deprecated function is used.

## Movie Type

The `Movie` type is defined in `src/lib/movies.ts` and includes data from the TMDb API:

```typescript
interface Movie {
  id: number; // TMDb movie ID
  title: string; // Movie title
  description: string; // Overview/plot summary
  poster_path: string | null; // Path to poster image
  backdrop_path: string | null; // Path to backdrop image
  rating: number; // Vote average (0-10)
  tags: string[]; // Genre names
  year: number; // Release year
  duration: number; // Runtime in minutes
}
```

> **Note**: The Movie type was updated in July 2026 to support TMDb integration. Previously, it used fields like `emoji` and `posterGradient` for the curated list, but now uses actual TMDb data fields.

## How Components Use the Store

Components access the store via the `useDateStore` hook:

```typescript
import { useDateStore } from '@/lib/store';

function DatePicker() {
  const { date, setDate } = useDateStore();

  return (
    <div>
      <p>Selected date: {date || 'Not chosen'}</p>
      <input
        type="date"
        value={date ?? ''}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>
  );
}

// For accessing state without subscribing to updates:
const currentDate = useDateStore.getState().date;
```

### Selective Subscriptions

Zustand allows components to subscribe to only specific parts of the state:

```typescript
// Subscribe to date only (re-renders when date changes)
const date = useDateStore((state) => state.date);

// Subscribe to multiple values
const { date, time } = useDateStore((state) => ({
  date: state.date,
  time: state.time,
}));

// Subscribe to everything (not recommended for large stores)
const state = useDateStore();
```

This optimization prevents unnecessary re-renders when unrelated state changes.

## Data Flow Example

When a user progresses through the application:

1. **Landing Page** (`/`): No store interaction (just the initial yes/no question)
2. **Confirmation Page** (`/confirmation`): No store interaction (pure celebration)
3. **Date Page** (`/date`):
   - User selects a date
   - `setDate(selectedDate)` updates Zustand store
   - `syncUrl()` updates URL search params
   - Store persists to sessionStorage
4. **Time Page** (`/time`):
   - `syncState()` hydrates from URL on mount
   - Component reads `date` from store for context
   - User selects a time
   - `setTime(selectedTime)` updates Zustand store
   - `syncUrl()` updates URL search params
5. **Movie Page** (`/movie`):
   - `syncState()` hydrates from URL on mount
   - Component reads `date` and `time` from store for display
   - User searches and selects a movie
   - `setMovie(selectedMovie)` updates Zustand store
   - `syncUrl()` updates URL search params
6. **Summary Page** (`/summary`):
   - `syncState()` hydrates from URL on mount
   - Reads all values from store to display the confirmation
   - Guard: redirects to `/date` if any required field is missing
7. **Success Page** (`/success`):
   - `syncState()` hydrates from URL on mount
   - Displays final plan with all selections
   - "Plan Another Date" calls `reset()` then navigates to `/`

## Benefits of This Approach

- **Simplicity**: Minimal boilerplate compared to Redux or Context API
- **Performance**: Components only re-render when the specific state they subscribe to changes
- **DevTools**: Excellent DevTools integration for time-travel debugging
- **Persistence**: Automatic saving/loading with customizable storage
- **Type Safety**: Full TypeScript support with inferred types
- **Modularity**: Easy to split into multiple stores if the app grows significantly
- **URL Sync**: Seamless integration with browser navigation

## When to Consider Alternatives

While Zustand is ideal for this application's current scale, consider these alternatives if the app grows significantly:

1. **Redux Toolkit**: For complex state logic with middleware, time-travel debugging, and extensive ecosystem
2. **Jotai**: For atomic state management when state can be naturally decomposed into independent atoms
3. **React Query**: For server state (already used in the app via `@tanstack/react-query`)
4. **Context API + useReducer**: For very simple state sharing without external dependencies

## Best Practices Followed

1. **Single Source of Truth**: All date/time/movie state lives in one store
2. **Immutability**: Zustand handles immutability internally; we never mutate state directly
3. **Selective Subscriptions**: Components use selectors to subscribe only to needed state properties
4. **Action Separation**: State update logic is centralized in the store actions
5. **Persistence Awareness**: Store is designed to survive refreshes but not necessarily long-term storage
6. **SSR Compatibility**: Store works during server-side rendering (important for SEO and performance)
7. **URL Sync**: State is synchronized with URL for shareable, bookmarkable flows

## Extending the Store

To add new state properties (e.g., for user preferences or additional planning steps):

1. Add the field to the `DateState` interface in `src/lib/store.ts`
2. Add the initial value in the `set` function
3. Add a setter function (e.g., `setNewField`)
4. Update the `partialize` function if the new state should persist
5. Update `useUrlSync` hook to sync the new field to URL (add to `MANAGED_KEYS`)
6. Consider whether the new state should also persist (it will by default with sessionStorage)

Example:

```typescript
// In store.ts
interface DateState {
  // ... existing fields
  location: string | null;
  setLocation: (location: string) => void;
}

const useDateStore = create<DateState>()(
  persist(
    (set, get) => ({
      // ... existing state
      location: null,
      setLocation: (location) => set({ location }),
    }),
    {
      name: "date-plan",
      partialize: (state) => ({
        // ... existing fields
        location: state.location,
      }),
    }
  )
);

// In useUrlSync.ts
const MANAGED_KEYS = ["date", "time", "movie", "love", "theme", "location"] as const;
```

## Debugging

- **React DevTools**: Shows components subscribing to the store
- **Zustand DevTools**: Enable by importing `devtools` from `zustand/middleware` and wrapping the store:
  ```typescript
  import { devtools } from 'zustand/middleware';
  
  const useDateStore = create<DateState>()(
    devtools(
      persist((set) => ({ /* state */ })),
      { name: 'DateStore' }
    )
  );
  ```
- **Console Logging**: Add `console.log` inside setters for debugging (remove before production)
- **Router DevTools**: Use TanStack Router's devtools to trace navigation

## Testing Considerations

The store can be easily tested in isolation:

```javascript
import { useDateStore } from '@/lib/store';

// Reset state before each test
beforeEach(() => {
  // Get fresh state for each test
  const { reset } = useDateStore.getState();
  reset();
});

test('updates date correctly', () => {
  const testDate = '2026-07-20';
  useDateStore.getState().setDate(testDate);
  expect(useDateStore.getState().date).toBe(testDate);
});

test('reset clears all state', () => {
  const { setDate, setTime, reset } = useDateStore.getState();
  setDate('2026-07-20');
  setTime('19:30');
  reset();
  expect(useDateStore.getState().date).toBe(null);
  expect(useDateStore.getState().time).toBe(null);
});
```

Note: Actual unit tests would require a testing setup (Jest/Vitest) which is not currently included in this project.

## Common Pitfalls & Solutions

### State updates not triggering re-renders
- **Cause**: Component not subscribing to the specific state value
- **Solution**: Use selector to subscribe to the exact value: `const date = useDateStore(s => s.date)`

### URL not updating when state changes
- **Cause**: Not using `useUrlSync` hook or not calling `syncUrl()`
- **Solution**: Import `useUrlSync` and call `syncUrl()` in a `useEffect` when state changes

### Navigation not working
- **Cause**: Using `window.history` instead of TanStack Router's `navigate()`
- **Solution**: Use `navigate({ to: '/path' })` from `@tanstack/react-router`

### State not persisting across refreshes
- **Cause**: Value not included in `partialize` function
- **Solution**: Add the field to the `partialize` function in the persist middleware

### Browser back/forward not working correctly
- **Cause**: Using direct `window.history` manipulation
- **Solution**: Use TanStack Router's `navigate()` API and `useUrlSync` hook

---

*This document explains the current state management implementation as of July 11, 2026. For the most up-to-date information on implementation details, refer to the source code files referenced throughout this document.*
