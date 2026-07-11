/**
 * Storage utilities for synchronizing state with localStorage and URL parameters
 *
 * NOTE: This file is being migrated to use @/hooks/useUrlSync for proper
 * TanStack Router integration. The old syncUrlWithState function is deprecated
 * and should not be used in new code.
 *
 * For new code, use:
 * ```tsx
 * import { useUrlSync } from "@/hooks/useUrlSync";
 * const { syncUrl, syncState } = useUrlSync();
 * ```
 */

import { useDateStore } from "./store";

const MANAGED_KEYS = ["date", "time", "movie", "love", "theme"] as const;

/**
 * @deprecated Use `useUrlSync` hook instead.
 * This function directly manipulates window.history which conflicts with TanStack Router.
 * It's kept for temporarily backwards compatibility but will be removed.
 */
export const syncUrlWithState = () => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const {
    date,
    time,
    movie,
    loveMessage,
    isDarkMode,
    setDate,
    setTime,
    setMovie,
    setLoveMessage,
    setDarkMode,
  } = useDateStore.getState();
  const urlParams = new URLSearchParams(window.location.search);

  // Update state from URL parameters
  const urlDate = urlParams.get("date");
  const urlTime = urlParams.get("time");
  const urlMovieId = urlParams.get("movie");
  const urlLove = urlParams.get("love");
  const urlTheme = urlParams.get("theme");

  if (urlDate && date !== urlDate) {
    setDate(urlDate);
  }
  if (urlTime && time !== urlTime) {
    setTime(urlTime);
  }
  if (urlMovieId && movie) {
    // Note: We can't directly set movie by ID without fetching it
    // This would require movie service integration
  }
  if (urlLove && loveMessage !== urlLove) {
    setLoveMessage(urlLove);
  }
  if (urlTheme === "dark" && !isDarkMode) {
    setDarkMode(true);
  } else if (urlTheme !== "dark" && isDarkMode) {
    setDarkMode(false);
  }

  // Update URL from state
  const updateUrlFromState = () => {
    const existing = new URLSearchParams(window.location.search);
    MANAGED_KEYS.forEach((k) => existing.delete(k));

    const currentState = useDateStore.getState();
    if (currentState.date) existing.set("date", currentState.date);
    if (currentState.time) existing.set("time", currentState.time);
    if (currentState.movie) existing.set("movie", currentState.movie.id.toString());
    if (currentState.loveMessage) existing.set("love", currentState.loveMessage);
    if (currentState.isDarkMode) existing.set("theme", "dark");

    const query = existing.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

    // IMPORTANT: Use router.navigate instead of window.history.replaceState
    // For now, fall back to window.history but log a warning
    console.warn(
      `[DEPRECATED] syncUrlWithState using window.history.replaceState. ` +
        `Use useUrlSync hook instead for proper TanStack Router integration.`,
    );
    window.history.replaceState({ ...window.history.state, us: Date.now() }, "", newUrl);
  };

  return updateUrlFromState;
};

/**
 * Parses movie ID from URL and returns it
 */
export const getMovieIdFromUrl = (): number | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("movie");
  return movieId ? parseInt(movieId, 10) : null;
};

/**
 * Creates a shareable URL with current state
 * @deprecated Use createShareableUrl from @/hooks/useUrlSync instead
 */
export const createShareableUrl = (): string => {
  if (typeof window === "undefined") return window.location.origin;

  const { date, time, movie, loveMessage, isDarkMode } = useDateStore.getState();
  const params = new URLSearchParams(window.location.search);

  if (date) params.set("date", date);
  if (time) params.set("time", time);
  if (movie) params.set("movie", movie.id.toString());
  if (loveMessage) params.set("love", loveMessage);
  if (isDarkMode) params.set("theme", "dark");

  return `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
};
