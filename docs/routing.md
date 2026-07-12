# Routing System

## Overview

Datenight uses **file-based routing** powered by
[TanStack Router](https://tanstack.com/router/latest) through the
TanStack Start framework. Each file inside
[`src/routes`](../src/routes) maps to a route, where the file's path
determines the URL.

The router auto-generates the type-safe route table in
[`src/routeTree.gen.ts`](../src/routeTree.gen.ts) — **do not edit it
manually**.

## How It Works

- Each `.tsx` file inside `src/routes/` defines a route component.
- **Route ID convention with TanStack Start**: the route ID is the absolute
  path (e.g. `createFileRoute('/date')`), not a relative path string. This
  is what allows the auto-generated `routeTree.gen.ts` to produce fully
  typed routes.
- `__root.tsx` provides the application wrapper (providers, meta, fonts,
  root decorations) and exposes both `notFoundComponent` and
  `errorComponent` to the router.
- The router configuration is in [`src/router.tsx`](../src/router.tsx).

## Current Application Routes

| Route ID                       | URL path           | Purpose                                        | File                                                            |
| ------------------------------ | ------------------ | ---------------------------------------------- | --------------------------------------------------------------- |
| `/`                            | `/`                | Landing page with yes / no question            | [`src/routes/index.tsx`](../src/routes/index.tsx)               |
| `/begging`                     | `/begging`         | Playful dodging "No" button screen             | [`src/routes/begging.tsx`](../src/routes/begging.tsx)           |
| `/confirmation`                | `/confirmation`    | Celebration after "YES" decision               | [`src/routes/confirmation.tsx`](../src/routes/confirmation.tsx) |
| `/date`                        | `/date`            | Calendar / quick chips for the outing date     | [`src/routes/date.tsx`](../src/routes/date.tsx)                 |
| `/time`                        | `/time`            | Time-of-day picker (chips + native input)      | [`src/routes/time.tsx`](../src/routes/time.tsx)                 |
| `/movie`                       | `/movie`           | Live TMDb search and movie selection           | [`src/routes/movie.tsx`](../src/routes/movie.tsx)               |
| `/love-letter`                 | `/love-letter`     | Curate / shuffle / edit / share love letter    | [`src/routes/love-letter.tsx`](../src/routes/love-letter.tsx)   |
| `/summary`                     | `/summary`         | Review of date, time, movie + countdown        | [`src/routes/summary.tsx`](../src/routes/summary.tsx)           |
| `/success`                     | `/success`         | Terminal celebration; navigation locked        | [`src/routes/success.tsx`](../src/routes/success.tsx)           |
| `/sitemap.xml`                 | `/sitemap.xml`     | Auto-generated XML sitemap                     | [`src/routes/sitemap[.]xml.ts`](../src/routes/sitemap%5B.%5Dxml.ts) |

### Layout Routes

The application uses a single root layout — every screen renders inside
the same shell:

[`__root.tsx`](../src/routes/__root.tsx) provides:

- React Query client provider.
- Background context / layer / variant-sync (one persistent gradient).
- `<TopProgressBar />` step indicator.
- `<HeartExplosion />` shake-triggered celebration.
- Floating decorations and `<BottomControlBar />` controls.
- Sonner `<Toaster />` for toast notifications.
- A 404 `notFoundComponent` and an `errorComponent` that reports to
  Lovable's error capture utility.

## Navigation

Navigation between pages always goes through TanStack Router's APIs —
**never** through `window.history`.

### Use `useNavigate`

```tsx
import { useNavigate } from "@tanstack/react-router";

function SomeComponent() {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate({ to: "/time" });
  };

  const handleBack = () => {
    navigate({ to: -1 }); // browser back
  };

  return <button onClick={handleNext}>Continue</button>;
}
```

### Use `<Link>`

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/summary">Review your plan</Link>
```

### Programmatic Options

```ts
navigate({ to: "/summary", replace: true });
```

## URL Synchronisation

The application keeps its Zustand store and the URL in lockstep via
[`src/hooks/useUrlSync.ts`](../src/hooks/useUrlSync.ts). This replaces the
historical, problematic `syncUrlWithState` function in
`src/lib/storage.ts` and avoids `window.history` entirely.

### Why the rewrite?

Earlier versions had several issues:

1. **`window.history.replaceState` conflict** — bypassed the router's
   internal state, leaving it unaware of URL changes.
2. **Duplicate sync logic** — each route had its own closure, producing
   race conditions.
3. **Render-time side effects** — navigation ran during render, causing
   the router to mount the wrong component on first paint.

The new hook fixes all three by:

- Calling `navigate({ to: url, replace: true })` instead of touching
  `window.history`.
- Centralising the bidirectional sync in a single hook instance.
- Using `useEffect` (never render) for every side effect.

### URL Parameter Mapping

| Store value     | URL parameter | Format                       |
| --------------- | ------------- | ---------------------------- |
| `date`          | `date`        | ISO `yyyy-MM-dd`             |
| `time`          | `time`        | 24-hour `HH:mm`              |
| `movie.id`      | `movie`       | numeric TMDb ID              |
| `loveMessage`   | `love`        | URL-encoded string           |
| `isDarkMode`    | `theme`       | `dark` if on, omitted if off |

Example: `/movie?date=2026-07-15&time=19:30&movie=12345&theme=dark`

### Usage Pattern

```tsx
import { useUrlSync } from "@/hooks/useUrlSync";

function TimePickerPage() {
  const { syncUrl, syncState } = useUrlSync();
  const { time, setTime } = useDateStore();

  // Hydrate from URL on mount.
  useEffect(() => { syncState(); }, [syncState]);

  // Push state changes back to the URL.
  useEffect(() => {
    if (time) syncUrl();
  }, [time, syncUrl]);

  // ...render...
}
```

Additional helpers from the same module:

- `createShareableUrl()` — produces a self-contained share URL.
- `getMovieIdFromUrl()` — extracts the `?movie=` ID for hydration.

### Benefits

- ✅ First-click navigation is reliable.
- ✅ URL search params stay in sync with the store.
- ✅ Browser back / forward works correctly.
- ✅ Refresh restores the active step + selections.
- ✅ Progress bar matches the active route.
- ✅ No `window.history` manipulation anywhere.
- ✅ Non-managed query params (UTM tags, etc.) are preserved.

## Progress Bar

[`TopProgressBar`](../src/components/TopProgressBar.tsx) sits at the
top of the viewport and is rendered once at the root. It reads the
active step directly from the URL via
[`useRouteStep`](../src/hooks/useRouteStep.ts), so it stays
synchronised across deep links, refreshes, and forward / back
navigation.

### Step Table

| Step | Route         | Label      | Icon             |
| ---- | ------------- | ---------- | ---------------- |
| 1    | `/`           | Start      | `Heart`          |
| 2    | `/date`       | Date       | `CalendarHeart`  |
| 3    | `/time`       | Time       | `Clock`          |
| 4    | `/movie`      | Movie      | `Film`           |
| 5    | `/summary`    | Summary    | `Sparkles`       |
| 6    | `/success`    | Celebrate  | `PartyPopper`    |

`/begging`, `/confirmation` and `/love-letter` are intentionally **not**
numbered steps — they're treated as alternatives or schema pieces.

### Step Reachability

- Steps `<= current` are reachable. Clicking a previous step jumps
  the user back to its entry route.
- Steps `> current` are blocked unless the requirement has been
  satisfied (e.g. a date selected).
- On `/success`, navigation is **locked** — only the in-page
  "Plan another date" CTA can restart the flow.

## Route Guards

Some routes redirect away when prerequisites are missing. The
reminder is consistent: **always do navigation inside `useEffect`**.

### `/time` and `/movie` require a date

```tsx
useEffect(() => {
  if (!date) {
    navigate({ to: "/date" });
  }
}, [date, navigate]);
```

### `/summary` requires date + time + movie

```tsx
useEffect(() => {
  if (!date || !time || !movie) {
    navigate({ to: "/date" });
  }
}, [date, time, movie, navigate]);
```

## Adding a New Route

1. **Create the file** under [`src/routes/`](../src/routes) with the
   appropriate name (e.g. `profile.tsx`).
2. **Export a `Route`** constant using
   `createFileRoute('/profile')({ component: ProfilePage })`.
3. **Hydrate from URL** with `useUrlSync()` if the route reads or
   writes any persisted state.
4. **Update the progress bar** by editing
   [`STEP_DEFS` in `TopProgressBar.tsx`](../src/components/TopProgressBar.tsx)
   and the route map in [`useRouteStep.ts`](../src/hooks/useRouteStep.ts).
5. **Test it manually** — `bun run dev` and walk through each entry
   point.

## Type Safety

Thanks to TanStack Router's code generation:

- Navigating to a non-existing path is a **compile-time error**.
- `useMatch` infers the exact route tree.
- Auto-complete suggests valid paths and search params.

## Best Practices

1. **Always route through `navigate()` or `<Link>`**.
2. **Place navigation in `useEffect`** (or event handlers), never in
   the render body.
3. **Use `useUrlSync()` for any state you'd like to live in the URL**.
4. **Preserve non-managed params** — the hook already does this.

### Anti-Patterns

```tsx
// ❌ Direct window.history
window.history.pushState({}, '', '/foo');
window.history.replaceState({}, '', '/foo');
window.history.back();

// ❌ Navigation in render
if (!date) navigate({ to: '/date' });

// ❌ Re-creating sync logic per render
const updateUrl = syncUrlWithState(); // stale closure
```

### Correct Patterns

```tsx
// ✅ Router-aware navigation
navigate({ to: '/summary' });
navigate({ to: -1 });                       // back in history

// ✅ useEffect-guarded navigation
useEffect(() => {
  if (!date) navigate({ to: '/date' });
}, [date, navigate]);

// ✅ Centralised URL sync
const { syncUrl } = useUrlSync();
useEffect(() => { syncUrl(); }, [state, syncUrl]);
```

## Troubleshooting

### Route not found
- Verify the file exists in `src/routes/` with the correct name.
- Restart the dev server so `@tanstack/router-plugin` picks up new files.
- Check that the route ID passed to `createFileRoute()` matches the path.

### TypeScript errors after adding a route
- Regenerate `routeTree.gen.ts` by running `bun run dev`.
- Make sure the imported `Route` constant uses the same path/ID.

### Navigation not updating the page
- Confirm you're calling `navigate()` from `@tanstack/react-router`.
- Move the call into `useEffect` or an event handler.
- Verify you haven't accidentally used `window.history`.

## Further Reading

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Start Routing Guide](https://tanstack.com/start/latest/docs/framework/router)
- [File-based Routing Conventions](https://tanstack.com/router/latest/docs/framework/react/file-conventions)
