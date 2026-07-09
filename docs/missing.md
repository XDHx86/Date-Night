# Missing Features and Known Issues

## Implemented Features

1. **TMDb API Integration** - ✅
   - Integrated TMDB API for movie search and real posters in `src/lib/movies.ts`.
   - Falls back to curated list when API keys are not configured or on error.
   - Displays real posters from TMDB when available, otherwise uses gradient.
   - Includes backdrop image for recommended movies.

2. **Shareable Links** - ✅
   - Added URL synchronization to preserve state (date, time, movie) in `src/lib/storage.ts`.
   - Share button in movie picker page copies a URL with the current state.
   - On app load, state is restored from URL parameters.

3. **Countdown Timer** - ✅
   - Added `CountdownTimer` component in `src/components/CountdownTimer.tsx`.
   - Displayed on summary and success pages showing time until selected date.

4. **Randomized Messages** - ✅
   - Created `src/lib/messages.ts` with categorized messages.
   - Created `useRandomMessage` hook in `src/hooks/useRandomMessage.ts`.
   - Used in landing, begging, confirmation, date, time, movie, summary, success, and love letter pages.

5. **Progress Indicator** - ✅
   - Created `ProgressIndicator` component in `src/components/ProgressIndicator.tsx`.
   - Added to all pages to show current step in the journey (1-6).

6. **LocalStorage Persistence** - ✅
   - Changed Zustand store in `src/lib/store.ts` to use `localStorage` instead of `sessionStorage`.
   - State persists across page reloads and browser sessions.

7. **Upgraded Celebration** - ⚠️ Partially Implemented
   - Kept the existing `HeartBurst` component for celebrations.
   - Increased the number of pieces in success page (40) and confirmation (36).
   - Did not implement a new confetti physics system; however, the HeartBurst provides a particle effect.
   - For a more realistic confetti, consider integrating a library like `canvas-confetti`.

8. **Unique Animated Backgrounds** - ⚠️ Component Created, Not Unique per Page
   - Created `AnimatedBackground` component in `src/components/AnimatedBackground.tsx` with options for different variants (hearts, sparkles, stars, flowers, gradient shift).
   - Currently, all pages use the same base animated background (gradient shift). To have unique backgrounds per page, each page would need to specify a different variant.

9. **Optional Embedded Spotify Playlist** - ✅
   - Created `SpotifyEmbed` component in `src/components/SpotifyEmbed.tsx`.
   - Conditioned on `VITE_SPOTIFY_PLAYLIST_ID` environment variable.
   - Added to summary and success pages.

10. **Heartfelt Love Letter Page** - ✅
    - Created `src/routes/love-letter.tsx` route and component.
    - Allows viewing and editing a custom love message stored in the Zustand store.

11. **My Recommendation Badge** - ✅
    - Added `isRecommendation` flag to movie data in `src/lib/movies.ts`.
    - Displayed as a badge (⭐ My Pick) in `MovieCard` component.
    - By default, the third suggested movie is marked as a recommendation.

12. **Dynamic Movie Picker Backdrop** - ⚠️ Implemented in Card, Not Page Background
    - Enhanced `MovieCard` to display the movie's backdrop image as a background effect when the movie is a recommendation and has a backdrop.
    - The movie picker page background itself does not change; however, the card provides a visual backdrop effect.

13. **Mobile Shake Easter Egg** - ✅
    - Created `useShakeEffect` hook in `src/hooks/useShakeEffect.ts`.
    - Integrated in `src/routes/__root.tsx` to trigger a heart explosion (150 pieces) on device shake.
    - Works on mobile devices that support the `devicemotion` event.

14. **Clickable Moon Easter Egg for Night Mode** - ⚠️ State Implemented, UI Missing
    - Added `isDarkMode` state and toggle functions in `src/lib/store.ts`.
    - Added a moon button in the movie picker page (`src/routes/movie.tsx`) that toggles dark mode.
    - However, the actual dark mode styling (CSS changes) has not been implemented. To complete this, you would need to:
        - Add CSS variables for dark mode in `src/styles.css` or create a dark mode class.
        - Apply the dark mode class to the root element when `isDarkMode` is true.

## Known Issues and Bugs

1. **Dark Mode Styling Missing** - The dark mode toggle stores the state but does not change the appearance of the application. You need to add CSS for dark mode.

2. **Shareable Link Movie Restoration** - The shareable link includes the movie ID, but the movie picker page does not currently restore the movie selection from the URL. It only restores date and time. To fully restore the movie, you would need to fetch the movie by ID from the TMDB API or local cache and set it in the store.

3. **Animated Background Performance** - The `AnimatedBackground` component uses CSS animations that may have performance implications on lower-end devices. Consider using `requestAnimationFrame` or a more performant method for complex animations.

4. **HeartBurst on Shake May Be Too Intense** - The heart burst on shake uses 150 pieces, which might be overwhelming. Consider making it configurable or less intense.

5. **TMDB API Error Handling** - While we have error handling that falls back to the local cache, we do not inform the user when the TMDB API is unavailable or when there is an error. Consider adding a toast or banner to notify the user.

6. **Love Letter Page Accessibility** - The love letter page is accessible from the success page, but there is no way to access it from other pages. Consider adding a link in the header or footer.

## Missing Tests

- No unit or integration tests have been added for the new features.
- Consider adding tests for:
  - Zustand store persistence and synchronization.
  - Movie search with TMDB fallback.
  - Shareable link functionality.
  - Countdown timer accuracy.
  - Random message hook.
  - Progress indicator steps.
  - Animated background variants.
  - Spotify embed component.
  - Love letter page functionality.
  - Shake effect hook.
  - Dark mode toggle.

## Suggested Future Improvements

1. Implement true dark mode with CSS changes.
2. Enhance the shareable link to restore movie selection.
3. Replace HeartBurst with a more sophisticated confetti animation for celebrations.
4. Assign unique animated backgrounds to each page (e.g., hearts for landing, sparkles for begging, etc.).
5. Add notifications for TMDB API errors and successes.
6. Write unit and integration tests for critical functionality.
7. Optimize the animated background for performance.
8. Add a way to access the love letter page from the header or footer in all pages.
9. Consider adding a feature to save multiple love letters.
10. Add a feature to share the love letter via social media or messaging.

---

*This document was generated as part of the feature implementation process for the Datenight project.*
*Last updated: 2026-07-09
*/