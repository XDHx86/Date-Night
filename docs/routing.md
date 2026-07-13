# Routing System

## Overview

Datenight uses **file-based routing** powered by [TanStack Router](https://tanstack.com/router/latest)
through its Vite plugin (`@tanstack/router-plugin`). Each file inside
[`src/routes`](../src/routes) maps to a route, where the file's path determines
the URL.

The router auto-generates the type-safe route table in
[`src/routeTree.gen.ts`](../src/routeTree.gen.ts) — **do not edit it manually**.
It regenerates on every `vite dev` / `vite build` run.

Because the application is now a pure SPA with no server, every URL is rendered
on the client. Deep links (`…/success`, `…/movie?theme=dark`) work directly
in the browser because GitHub Pages' `404.html` fallback boots the same SPA
shell that the index page would.

## How It Works

- Each `.tsx` file inside `src/routes/` defines a route component.
- `__root.tsx` provides the application wrapper (providers, root decorations)
  and exposes both `notFoundComponent` and `errorComponent` to the router.
- The router instance is constructed in [`src/router.tsx`](../src/router.tsx)
  and mounted by [`src/main.tsx`](../src/main.tsx).
- The document `<head>` (title, meta, fonts) lives in
  [`index.html`](../index.html) — the SPA is single-document, so there is no
  per-route head injection.

## Current Application Routes

| Route ID        | URL path        | Purpose                                     | File                                                            |
| --------------- | --------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `/`             | `/`             | Landing page with yes / no question         | [`src/routes/index.tsx`](../src/routes/index.tsx)               |
| `/begging`      | `/begging`      | Playful dodging "No" button screen          | [`src/routes/begging.tsx`](../src/routes/begging.tsx)           |
| `/confirmation` | `/confirmation` | Celebration after "YES" decision            | [`src/routes/confirmation.tsx`](../src/routes/confirmation.tsx) |
| `/date`         | `/date`         | Calendar / quick chips for the outing date  | [`src/routes/date.tsx`](../src/routes/date.tsx)                 |
| `/time`         | `/time`         | Time-of-day picker (chips + native input)   | [`src/routes/time.tsx`](../src/routes/time.tsx)                 |
| `/movie`        | `/movie`        | Live TMDb search and movie selection        | [`src/routes/movie.tsx`](../src/routes/movie.tsx)               |
| `/love-letter`  | `/love-letter`  | Curate / shuffle / edit / share love letter | [`src/routes/love-letter.tsx`](../src/routes/love-letter.tsx)   |
| `/summary`      | `/summary`      | Review of date, time, movie + countdown     | [`src/routes/summary.tsx`](../src/routes/summary.tsx)           |
| `/success`      | `/success`      | Terminal celebration; navigation locked     | [`src/routes/success.tsx`](../src/routes/success.tsx)           |

The historical TanStack Start server route for the sitemap is gone — see
`public/sitemap.xml` for the static sitemap served at `/sitemap.xml`.

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

## SPA Fallback / Deep Links

GitHub Pages serves `404.html` whenever a request hits a path that has no
matching file in `dist/`. The build copies `dist/index.html` to
`dist/404.html` (see `scripts/copy-404.cjs`). The SPA shell boots from
either file and TanStack Router reads `window.location.pathname`, so deep
links like `/Date-Night/success` resolve to the correct React component
without any server-side help.

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

<Link to="/summary">Review your plan</Link>;
```

### Programmatic Options

```ts
navigate({ to: "/summary", replace: true });
```

## URL Synchronisation

The application keeps its Zustand store and the URL in lockstep via
[`src/hooks/useUrlSync.ts`](../src/hooks/useUrlSync.ts). It centralises
the bidirectional sync in a single hook instance and uses `useEffect`
(never render) for every side effect.

### URL Parameter Mapping

| Store value   | URL parameter | Format                       |
| ------------- | ------------- | ---------------------------- |
| `date`        | `date`        | ISO `yyyy-MM-dd`             |
| `time`        | `time`        | 24-hour `HH:mm`              |
| `movie.id`    | `movie`       | numeric TMDb ID              |
| `loveMessage` | `love`        | URL-encoded string           |
| `isDarkMode`  | `theme`       | `dark` if on, omitted if off |

Example: `/movie?date=2026-07-15&time=19:30&movie=12345&theme=dark`

### Usage Pattern

```tsx
import { useUrlSync } from "@/hooks/useUrlSync";

function TimePickerPage() {
  const { syncUrl, syncState } = useUrlSync();
  const { time, setTime } = useDateStore();

  // Hydrate from URL on mount.
  useEffect(() => {
    syncState();
  }, [syncState]);

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

## Progress Bar

[`TopProgressBar`](../src/components/TopProgressBar.tsx) sits at the
top of the viewport and is rendered once at the root. It reads the
active step directly from the URL via
[`useRouteStep`](../src/hooks/useRouteStep.ts), so it stays
synchronised across deep links, refreshes, and forward / back navigation.

### Step Table

| Step | Route      | Label     | Icon            |
| ---- | ---------- | --------- | --------------- |
| 1    | `/`        | Start     | `Heart`         |
| 2    | `/date`    | Date      | `CalendarHeart` |
| 3    | `/time`    | Time      | `Clock`         |
| 4    | `/movie`   | Movie     | `Film`          |
| 5    | `/summary` | Summary   | `Sparkles`      |
| 6    | `/success` | Celebrate | `PartyPopper`   |

`/begging`, `/confirmation` and `/love-letter` are intentionally **not**
numbered steps — they're treated as alternatives or schema pieces.

### Step Reachability

- Steps `<= current` are reachable. Clicking a previous step jumps the
  user back to its entry route.
- Steps `> current` are blocked unless the requirement has been
  satisfied (e.g. a date selected).
- On `/success`, navigation is **locked** — only the in-page
  "Plan another date" CTA can restart the flow.

## Route Guards

Some routes redirect away when prerequisites are missing. The pattern is
consistent: **navigation always lives inside `useEffect`**.

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
3. **Hydrate from URL** with `useUrlSync()` if the route reads or writes
   any persisted state.
4. **Update the progress bar** by editing `STEP_DEFS` in
   [`TopProgressBar.tsx`](../src/components/TopProgressBar.tsx) and the
   route map in [`useRouteStep.ts`](../src/hooks/useRouteStep.ts).
5. **Test it manually** — `npm run dev` and walk through each entry point.

## Type Safety

Thanks to TanStack Router's code generation:

- Navigating to a non-existing path is a **compile-time error**.
- `useMatch` infers the exact route tree.
- Auto-complete suggests valid paths and search params.

## Best Practices

1. **Always route through `navigate()` or `<Link>`**.
2. **Place navigation in `useEffect`** (or event handlers), never in
   the render body.
3. **Use `useUrlSync()`** for any state you'd like to live in the URL.
4. **Preserve non-managed params** — the hook already does this.

## Deployment-specific Path Prefix

When deployed to GitHub Pages the live URL is
`https://<owner>.github.io/Date-Night/…`. The build uses
`BASE_PATH=/Date-Night/` (see `vite.config.ts` and the `build:gh-pages`
script) so every asset and route is prefixed correctly.

## Further Reading

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [File-based Routing Conventions](https://tanstack.com/router/latest/docs/framework/react/file-conventions)
