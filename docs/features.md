# Features

A walkthrough of each Datenight screen and the cross-cutting systems
that tie them together.

## User Flow

```
/  →  /confirmation  →  /date  →  /time  →  /movie  →  /summary  →  /success
                       ↘ alternative: /  →  /begging  →  /confirmation
                                                                                  ↘ optional /love-letter
                                                                                  ↘ reset → /
```

State is synced between every screen via the URL and the Zustand store
— see [state-management.md](state-management.md). The persistent top
progress bar shows the user's current step at all times.

## Persistent Cross-Cutting Layers

These render **once at the root** so they survive route changes with
no flicker.

| Component                                                              | Responsibility                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`BackgroundContext`](../src/components/BackgroundContext.tsx)         | Holds the active background variant in a React context             |
| [`BackgroundLayer`](../src/components/BackgroundLayer.tsx)             | Cross-fades between gradients with `AnimatePresence`               |
| [`BackgroundVariantSync`](../src/components/BackgroundVariantSync.tsx) | Maps the current URL pathname to the variant                       |
| [`FloatingDecorations`](../src/components/FloatingDecorations.tsx)     | Combines `FloatingBackground` + `SparkleTrail`                     |
| [`TopProgressBar`](../src/components/TopProgressBar.tsx)               | Persistent step indicator (URL-driven)                             |
| [`BottomControlBar`](../src/components/BottomControlBar.tsx)           | Dark mode / audio / love letter shortcuts                          |
| [`useShakeEffect`](../src/hooks/useShakeEffect.ts)                     | Detects mobile shake (threshold `25`) and triggers heart explosion |
| [`HeartExplosion`](../src/components/HeartExplosion.tsx)               | Full-screen heart particle burst                                   |

## 1. Landing Page (`/`)

- Plays a celebratory chime and animates a yes/no bounce on click.
- `YES` → `sounds.celebrate()` → heading morphs (`YOU WILL?! 🥹` → `YAAAAAY ❤️`)
  → `/confirmation`.
- `NO` → `/begging`.
- Random opening message via [`useRandomMessage("encouragement")`](../src/hooks/useRandomMessage.ts).

## 2. Begging Page (`/begging`)

- Dodging "NO" button (random `x`/`y` offset on every interaction).
- Growing `YES` button (scale increases with each dodge).
- Cycling pleas (`Pleaseee 🥺`, …) under the puppy image.
- After 3+ dodges, shows: _(The "No" button seems a little... slippery 👀)_.

## 3. Confirmation Page (`/confirmation`)

- Plays a celebration chime on mount.
- Confetti via `<ConfettiCelebration />`.
- "Continue →" jumps straight into `/date`.

## 4. Date Picker (`/date`)

- Native `<input type="date">` clamped to today (computed **after**
  hydration to avoid SSR / client timezone mismatch).
- Quick chips: Today, Tomorrow, Day After, Next Week.
- The submit handler:
  1. Validates the date is non-empty and not in the past.
  2. Calls `setDate()` + `syncUrl()`.
  3. Defers navigation a tick so the store update is committed first.

## 5. Time Selector (`/time`)

- Quick chips: `18:00`, `19:30`, `20:00`, `21:00`.
- Native `<input type="time">` for custom times.
- Same store + URL sync pattern as `/date`.

## 6. Movie Selector (`/movie`)

- Hero icon (`Film`), search input, recommendation grid.
- **Live TMDb data** via
  [`searchMovies`](../src/lib/movies.ts) (results capped at 6).
- Initial recommendations loaded once via
  [`fetchOriginalRecommendations`](../src/lib/movies.ts)
  (cached in `localStorage` for 7 days).
- 250 ms debounce on input.
- Each card has a `Recommended` (first two) or `Classic` (last two)
  badge, plus the chosen state.
- Loading state spins the input icon; errors raise a Sonner toast.
- Selecting a movie fetches the full detail (with genres + runtime)
  before calling `setMovie()` + `syncUrl()` + navigation.

## 7. Love Letter Page (`/love-letter`)

- Pulls letters from [`src/data/loveLetters.ts`](../src/data/loveLetters.ts)
  (default / birthday / anniversary / valentine).
- The active category is resolved from
  [`VITE_LOVE_LETTER_CATEGORY`](../src/lib/loveLetterConfig.ts).
- Toolbar: shuffle, edit, generate shareable card, view current plan.
- Editing syncs to the store live (`setLoveMessage`).
- "Share Love Card" renders to a Canvas and either uses `navigator.share`
  with files or downloads `love-card.png` as a fallback.
- Toast notifications via Sonner for every user-visible action.
- **Feature flag:** set `VITE_LOVE_LETTER_FEATURE=disabled` to remove the page
  entirely — the route redirects to `/`, and the bottom-bar shortcut, the
  success-page CTA, and the landing hint all disappear. Unset (or any other
  value) keeps the feature on, so the default is enabled.

## 8. Summary Page (`/summary`)

- Reviews date, time, movie with a **movie backdrop background**
  (TMDB `backdrop_path` or poster fallback).
- Shows a count-down timer to `${date}T${time}:00`.
- Share button builds a URL with all params (date, time, movie, love,
  theme) and uses Web Share API with clipboard / `alert` fallback.
- Glass-morphism review card with TMDb tags as chips.
- "Confirm our date ❤️" → `/success`.

## 9. Success Page (`/success`)

- Same backdrop blur with a 60% opacity card overlay.
- Heart burst particle animation, with a Spring entrance.
- Countdown timer to the actual date / time.
- "Plan Another Date" calls `reset()` (preserves the audio preference)
  and navigates back to `/`.
- "View our love letter" → `/love-letter`.
- "Share our date plan" reproduces the share logic from `/summary`.

## Cross-Feature Systems

### Animation & Motion

- Persistent, framer-motion animated background (single rendered layer).
- Fade / slide entrance per route
  ([`PageShell`](../src/components/PageShell.tsx)).
- `prefers-reduced-motion` is respected globally via
  [`src/styles.css`](../src/styles.css).

### Sound

- Web Audio API synthesised blips in
  [`src/lib/sound.ts`](../src/lib/sound.ts)
  (`click`, `pop`, `celebrate`).
- Optional background audio (`/assets/audio/love.mp3`) via
  [`useBackgroundAudio`](../src/hooks/useBackgroundAudio.ts). Autoplay
  is attempted immediately and falls back to the first user
  interaction.
- Sound toggle lives in the bottom control bar; the preference lives in
  the Zustand store and survives "Plan another date".

### State & URL Sync

Every form-style step hydrates from the URL with
[`useUrlSync`](../src/hooks/useUrlSync.ts) and pushes updates back,
preserving non-managed query params. See
[state-management.md](state-management.md) for the contract.

### Random Copy

Eight categories of playful copy live in
[`src/lib/messages.ts`](../src/lib/messages.ts):
encouragement, playful, romantic, movie, time, date, celebration.
`useRandomMessage(category)` returns the first message on the server
or first client render and re-rolls in `useEffect` to avoid hydration
mismatches.

### Storage

`localStorage`-backed `zustand/persist` keeps the plan alive across
sessions. The 7-day recommendation cache in `localStorage` keeps the
movie picker snappy after the first load.

### Dark Mode

`isDarkMode` toggles the `dark` class on `<html>` in the root component.
Every CSS variable in [`src/styles.css`](../src/styles.css) has a
`transition` declaration, so the toggle feels smooth. Bottom control
bar updates the icon (moon ⇄ sun) and includes `aria-pressed`.

### Accessibility

- Persistent progress bar exposes `aria-current="step"` for the active
  step.
- Bottom control bar exposes `aria-pressed` for toggle buttons.
- Buttons include focus-visible rings via Tailwind utilities.
- Global `prefers-reduced-motion` media query disables most motion.
- Toast notifications respect screen-reader announcements via Sonner.

### Error Handling

- TMDb failures surface as Sonner toasts and fall back to
  recommendations / empty results.
- 404 and root-level errors are handled by
  [`__root.tsx`](../src/routes/__root.tsx) (with optional Lovable error
  reporting).

## Extending the App

- **New step** — add a route, update store, add the step to
  `TopProgressBar` and `useRouteStep`.
- **New player audio source** — pass `src` to `useBackgroundAudio`.
- **Different background palette** — edit
  `BackgroundLayer.GRADIENTS` and the per-variant durations.
- **Additional love-letter categories** — extend
  `src/data/loveLetters.ts`'s `categories` tuple and add a new entry
  array. `VITE_LOVE_LETTER_CATEGORY` validates against this list.
- **Another share target** — swap the Web Share call in
  `handleShareLoveCard` for a custom deep-link.
