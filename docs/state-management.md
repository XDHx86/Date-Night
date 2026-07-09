# State Management

Datenight uses [Zustand](https://zustand-demo.pmndrs.org/) for state management, chosen for its simplicity, minimal boilerplate, and excellent TypeScript integration. The application state is centered around the user's date night selections: date, time, and movie.

## Overview

The state is managed through a single store located at `src/lib/store.ts`. This store persists selections to `sessionStorage` so that users can refresh the page or temporarily leave the site without losing their progress.

## Store Structure

### State Interface

The store manages three key pieces of data:

```typescript
interface DateState {
  date: string | null;         // ISO format date string (yyyy-MM-dd)
  time: string | null;         // 24-hour format time string (HH:mm)
  movie: Movie | null;         // Selected movie object
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setMovie: (movie: Movie) => void;
  reset: () => void;
}
```

### State Values

- **date**: The selected date in ISO format (e.g., "2026-07-15"). `null` if no date has been chosen.
- **time**: The selected time in 24-hour format (e.g., "19:30"). `null` if no time has been selected.
- **movie**: The selected movie object (see [Movie Type](#movie-type) below). `null` if no movie has been selected.

### Actions

The store provides setter functions to update each piece of state:

- `setDate(date: string)`: Updates the date value
- `setTime(time: string)`: Updates the time value
- `setMovie(movie: Movie)`: Updates the movie selection
- `reset()`: Clears all selections (date, time, movie) back to `null`

## Persistence

The store uses [Zustand's persist middleware](https://github.com/pmndrs/zustand/blob/master/docs/middleware/persist.md) to save state to `sessionStorage` under the key `"date-plan"`.

Key aspects of the persistence implementation:

```javascript
persist(
  (set) => ({ /* state and actions */ }),
  {
    name: "date-plan",                           // Storage key
    storage: createJSONStorage(() =>             // Custom storage engine
      typeof window !== "undefined" 
        ? window.sessionStorage 
        : (undefined as unknown as Storage)      // Fallback for SSR
    ),
  }
);
```

- **Why sessionStorage?**: Chosen over `localStorage` because date plans are typically short-lived - relevant only for the current browsing session or day.
- **Server-Side Rendering compatibility**: The storage check ensures the code works during SSR (when `window` is undefined) by falling back to an in-memory store.
- **Automatic hydration**: On page load, the store automatically retrieves and restores any saved state from `sessionStorage`.

## Movie Type

The `Movie` type is defined in `src/lib/movies.ts`:

```typescript
interface Movie {
  id: number;
  title: string;
  year: number;
  rating: string;      // e.g., "PG-13"
  runtime: number;     // in minutes
  genres: string[];    // e.g., ["Comedy", "Romance"]
  overview: string;
  posterGradient: string; // CSS gradient string for the movie card background
  emoji: string;       // Representative emoji (e.g., "😂")
}
```

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
```

## Data Flow Example

When a user progresses through the application:

1. **Landing Page** (`/`): No store interaction (just the initial yes/no question)
2. **Date Page** (`/date`):
   - User selects a date
   - `onDateChange` handler calls `setDate(selectedDate)`
   - Store updates and persists to sessionStorage
3. **Time Page** (`/time`):
   - Component reads `date` from store to show context (e.g., "You selected July 15, 2026")
   - User selects a time
   - `onTimeChange` handler calls `setTime(selectedTime)`
4. **Movie Page** (`/movie`):
   - Component reads `date` and `time` from store for display
   - User searches and selects a movie
   - `onMovieSelect` handler calls `setMovie(selectedMovie)`
5. **Summary Page** (`/summary`):
   - Reads all three values from store to display the confirmation
6. **Success Page** (`/success`):
   - Same as summary, plus celebration animation triggers
7. **Start Over**:
   - "Start over" button calls `reset()` to clear all selections
   - User returns to the beginning

## Benefits of This Approach

- **Simplicity**: Minimal boilerplate compared to Redux or Context API
- **Performance**: Components only re-render when the specific state they subscribe to changes
- **DevTools**: Excellent DevTools integration for time-travel debugging
- **Persistence**: Automatic saving/loading with customizable storage
- **Type Safety**: Full TypeScript support with inferred types
- **Modularity**: Easy to split into multiple stores if the app grows significantly

## When to Consider Alternatives

While Zustand is ideal for this application's current scale, consider these alternatives if the app grows significantly:

1. **Redux Toolkit**: For complex state logic with middleware, time-travel debugging, and extensive ecosystem
2. **Jotai**: For atomic state management when state can be naturally decomposed into independent atoms
3. **React Query**: For server state (already used in the app via `@tanstack/react-query`)
4. **Context API + useReducer**: For very simple state sharing without external dependencies

## Best Practices Followed

1. **Single Source of Truth**: All date/time/movie state lives in one store
2. **Immutability**: Zustand handles immutability internally; we never mutate state directly
3. **Selective Subscriptions**: Components use array destructuring to subscribe only to needed state properties
4. **Action Separation**: State update logic is centralized in the store actions
5. **Persistence Awareness**: Store is designed to survive refreshes but not necessarily long-term storage
6. **SSR Compatibility**: Store works during server-side rendering (important for SEO and performance)

## Extending the Store

To add new state properties (e.g., for user preferences or additional planning steps):

1. Add the field to the `DateState` interface
2. Add the initial value in the `set` function
3. Add a setter function (e.g., `setNewField`)
4. Update the TypeScript interfaces if adding complex types
5. Consider whether the new state should also persist (it will by default)

## Debugging

- **React DevTools**: Shows components subscribing to the store
- **Zustand DevTools**: Enable by importing `devtools` from `zustand/middleware` and wrapping the store
- **Console Logging**: Add `console.log` inside setters for debugging (remove before production)

## Testing Considerations

The store can be easily tested in isolation:

```javascript
import { useDateStore } from '@/lib/store';

// Reset state before each test
useDateStore.getState().reset();

test('updates date correctly', () => {
  const testDate = '2026-07-20';
  useDateStore.getState().setDate(testDate);
  expect(useDateStore.getState().date).toBe(testDate);
});
```

Note: Actual unit tests would require a testing setup (Jest/Vitest) which is not currently included in this project.

---

*This document explains the current state management implementation. As the application evolves, the store may be refactored or split into multiple stores for concerns like user preferences, UI state, or API cache (though API cache is already handled by React Query).*