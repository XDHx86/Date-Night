# Follow-ups & Deferred Ideas

This file captures the user-visible improvements that landed later
than originally planned, and the ideas still worth tackling. Items here
are intentionally low-priority — production-ready features have all
been promoted into the feature list and changelog.

## Landed Late

### `src/lib/storage.ts` legacy helpers
The old `syncUrlWithState` function still exists for back-compat. It
logs a deprecation warning when called. To retire it:

- Audit the codebase for any remaining imports (currently none).
- Delete `src/lib/storage.ts`.

### `src/components/AnimatedBackground.tsx`
Retained for back-compat. The global `BackgroundLayer` is the actual
animated background. Consider deleting this component after a release.

### `src/components/SoundToggle.tsx`
Floating speaker toggle remained after the design moved audio controls
to the bottom bar. Candidates for removal.

### `src/components/ProgressIndicator.tsx`
The inline progress label/stepper is unused by the active flow. The
persistent `TopProgressBar` is what users actually see now.

## Improvements to consider

### TMDb error UX
TMDb failures surface as a Sonner toast; consider an inline engraved
error banner on `/movie` so users always see the cause.

### Caching visibility
Currently `localStorage` caches the curated recommendations for 7 days
invisibly. A "Refresh recommendations" affordance (`bun-cache reset`)
would let users pull fresh picks.

### Love-letter sharing
`/love-letter` exports a PNG via Canvas and uses Web Share / download.
A direct link to the letter itself (without a date) would be a small
addition.

### Multi-letter saving
The store only retains the latest `loveMessage`. A small history pane
inside `/love-letter` would let the user revisit previous drafts.

### Reduced-motion variants
`prefers-reduced-motion` is honoured globally, but specific surfaces —
like the `/success` heart burst — could ship dedicated simplified
variants rather than relying entirely on the global disable.

### Movie filters on `/movie`
Already has debounced search. Genre + year-range overlays would help
narrow large result sets.

### Streak / history
Track previous plans in `localStorage` and offer a quick "remake last
plan" CTA on `/`.

### Background-audio options
`useBackgroundAudio` plays a single bundled track (or skips silently).
A small playlist + volume slider in the bottom bar would round out the
ambient feel.
