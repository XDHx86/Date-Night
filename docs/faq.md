# Frequently Asked Questions

If your question isn't here, see the [documentation](../README.md) or
open an issue.

## General

### What is Datenight?
A playful web app that walks users through planning a date night —
from a "will you go out with me?" prompt to a celebration screen —
with smooth transitions, persistent state, live movies and a love-letter
composer.

### Is Datenight free?
Yes — MIT licensed, no accounts, no in-app purchases.

### Do I need to create an account?
No. There's no backend; everything stays in your browser via
`localStorage` and (for shared links) the URL.

### Is my data private?
Yes. Selections live in your browser's `localStorage`. The only external
requests are to TMDb when movie search is used, and optionally to Spotify
(only the playlist ID, no user data).

### Can I use Datenight on mobile?
Fully responsive. Try shaking the device — you'll get a heart-particle
explosion if your browser supports the `devicemotion` event.

### Does it work offline?
The shell, store and Zustand-persisted state work offline once loaded.
Live TMDb search and the Spotify embed need network access.

### How does the "NO" dodge?
The begging page (`src/routes/begging.tsx`) randomises the button's
position on every interaction. The "YES" button grows with each dodge.

### What happens on refresh?
Selections are restored from `localStorage`. The URL also contains the
active selections, so refreshing `/movie?date=...&time=...&movie=...`
brings you right back to the same step.

### Can I share my plan?
Yes — `/summary` and `/success` both have a share button. It uses the
Web Share API where available, otherwise copies a link with all
parameters to the clipboard.

### Why is the search capped at 6 results?
Cap keeps the picker snappy and predictable; the matcher doesn't pay an
extra cost for every keystroke.

### Languages?
Currently English only. Translations would slot nicely alongside the
existing `src/lib/messages.ts`.

## Technical

### What's the stack?
TanStack Start (React 19 + Vite 8), TanStack Router (file-based),
Zustand for state, Tailwind v4, Framer Motion, lucide-react, Radix UI
primitives, TMDb v3 API, date-fns, Web Audio API, Sonner.

See [tech-stack.md](tech-stack.md) for the full breakdown.

### How does state persistence work?
Zustand with the `persist` middleware saves the store under
`localStorage` key `date-plan`. See [state-management.md](state-management.md).

### How is the active progress step determined?
The URL. `useRouteStep` (`src/hooks/useRouteStep.ts`) maps the current
pathname to a number, clamps it, and exposes a `navLocked` flag for the
`/success` terminal step. The `TopProgressBar` reads from this hook, so
refreshes, back/forward and deep links all match.

### Where does the markdown live?
In [`src/data/loveLetters.ts`](../src/data/loveLetters.ts). Add a category
by extending `categories` and the per-category arrays.

### How do I run TMDb locally?
Set both `VITE_TMDB_API_KEY` and `VITE_TMDB_READ_ACCESS_TOKEN` in `.env`
and start the dev server. Without them, the movie page falls back to the
curated recommendations cache in `localStorage`.

### Why use `localStorage` instead of `sessionStorage`?
Plans persist across browser sessions so a Sunday question can be
answered on Monday without losing state. The trade-off is that you must
explicitly `reset()` (or click "Plan another date") to clear it.

### How are animations implemented?
With Framer Motion. Animation durations respect the user's
`prefers-reduced-motion` setting via a global media query in
`src/styles.css`.

### Is SSR used?
Yes — TanStack Start provides SSR by default. Routes that depend on
`window`, `localStorage`, or randomly generated values (e.g.
`useRandomMessage`, `ConfettiCelebration`) defer their random logic
to `useEffect` to keep hydration deterministic.

### Time zones?
Times are stored as `HH:mm` strings (24-hour, no zone conversion).
Dates are ISO `yyyy-MM-dd`. Both are interpreted in the user's local
zone when displayed.

### Can I change the theme?
Yes. The palette lives in CSS variables inside `src/styles.css`. Dark
mode is automatically toggled by the `dark` class on `<html>`, which
`__root.tsx` mirrors from `useDateStore().isDarkMode`.

### What if I select a past date?
`<input type="date">` has a `min` attribute set to today (computed
client-side to avoid SSR mismatch). Manual entry is also validated by
the `submit()` handler.

### Why do some movies share a backdrop?
The TMDb API sometimes returns null `backdrop_path`; `tmdbImages.ts`
falls back to `poster_path` so we still have artwork.

### Accessibility?
- Top progress bar: `aria-current="step"` for the active step.
- Bottom control bar: `aria-pressed` for toggle buttons.
- Focus-visible rings on every interactive element.
- `prefers-reduced-motion` reduces or disables motion.

### How do I run production locally?
```bash
bun run build
bun run preview
```

### Browsers?
Modern Chrome/Firefox/Safari/Edge. Older browsers may degrade visually;
ES modules, CSS variables and the Fetch API are required.

### Contributing
See [contributing.md](contributing.md). Tests: see
[testing.md](testing.md). CI: [ci-cd.md](ci-cd.md).

### License?
MIT — see [LICENSE](../license).

## Troubleshooting

### Won't start / blank screen
1. Try `Node 20+`.
2. Delete `node_modules` and reinstall: `bun install`.
3. Check the browser console.
4. Try a different port: `PORT=4000 bun run dev`.

### Movie search returns nothing
1. Verify both `VITE_TMDB_API_KEY` and `VITE_TMDB_READ_ACCESS_TOKEN`.
2. The dev server picks values up **after** restart.
3. Without keys, the curated picks cache still serves the picker for
   7 days (`localStorage` key `curatedRecommendations`).

### Animations distracting
Toggle your OS "reduce motion" setting; the global media query
disables most animation.

### Selections not persisting
1. Not in incognito with restricted storage.
2. Browser not blocking `localStorage`.
3. Storage quota isn't exhausted.

### "Module not found"
- `bun install` from the project root.
- Verify your package manager matches the lockfile.

### Slow overall
Close other tabs, especially during E2E runs; disable chrome extensions
that inject scripts.

### Reset everything
- "Plan another date" on `/success`.
- Clear site data for the dev origin in dev tools.
- Manually `localStorage.clear()`.

### Need logs?
Most utilities are no-ops when env vars are missing. Open dev tools,
add a `console.log` if you really must (don't ship them).
