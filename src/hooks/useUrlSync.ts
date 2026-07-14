/**
 * Centralized URL synchronization hook for managing state <-> URL sync
 * with TanStack Router.
 *
 * This hook provides a single source of truth for URL synchronization,
 * using the router's navigate API instead of direct window.history manipulation.
 */

import { useNavigate, useLocation } from "@tanstack/react-router";
import { useDateStore } from "@/lib/store";
import { useEffect, useCallback, useRef } from "react";

const MANAGED_KEYS = ["date", "time", "movie", "love", "theme"] as const;

/**
 * Parses URL search params and updates Zustand store accordingly.
 * This is the URL -> State direction.
 */
function syncStateFromUrl(): void {
  if (typeof window === "undefined") return;

  const { setDate, setTime, setMovie, setLoveMessage, setDarkMode } = useDateStore.getState();
  const urlParams = new URLSearchParams(location.search);

  const urlDate = urlParams.get("date");
  const urlTime = urlParams.get("time");
  const urlMovieId = urlParams.get("movie");
  const urlLove = urlParams.get("love");
  const urlTheme = urlParams.get("theme");

  // Only update state if URL has values and they differ from current state
  const currentState = useDateStore.getState();

  if (urlDate && currentState.date !== urlDate) {
    setDate(urlDate);
  }
  if (urlTime && currentState.time !== urlTime) {
    setTime(urlTime);
  }
  // Note: movie is a complex object, we store only the ID in URL
  // The actual movie object is hydrated in the movie route
  if (urlLove && currentState.loveMessage !== urlLove) {
    setLoveMessage(urlLove);
  }
  if (urlTheme === "dark" && !currentState.isDarkMode) {
    setDarkMode(true);
  } else if (urlTheme !== "dark" && currentState.isDarkMode) {
    setDarkMode(false);
  }
}

/**
 * Builds search params from current Zustand state.
 * This is the State -> URL direction.
 */
function buildSearchParamsFromState(): URLSearchParams {
  const { date, time, movie, loveMessage, isDarkMode } = useDateStore.getState();
  const params = new URLSearchParams();

  if (date) params.set("date", date);
  if (time) params.set("time", time);
  if (movie) params.set("movie", movie.id.toString());
  if (loveMessage) params.set("love", loveMessage);
  if (isDarkMode) params.set("theme", "dark");

  return params;
}

/**
 * Centralized hook for URL synchronization.
 *
 * Usage:
 * ```tsx
 * const { syncUrl, syncUrlFromState } = useUrlSync();
 *
 * // Call this when state changes and you want to update the URL
 * syncUrl();
 *
 * // Call this on mount to sync state from URL
 * useEffect(() => { syncUrlFromState(); }, []);
 * ```
 *
 * This hook:
 * - Uses TanStack Router's navigate API (no direct window.history manipulation)
 * - Provides a single source of truth for URL sync
 * - Prevents race conditions by using a ref to track pending updates
 * - Preserves non-managed query parameters
 */
export function useUrlSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const updatePendingRef = useRef(false);

  // Sync state from URL (URL -> State)
  // This should be called on route mount to hydrate state from URL
  const syncStateFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;

    const { setDate, setTime, setLoveMessage, setDarkMode } = useDateStore.getState();
    const urlParams = new URLSearchParams(location.search);
    const currentState = useDateStore.getState();

    const urlDate = urlParams.get("date");
    const urlTime = urlParams.get("time");
    const urlLove = urlParams.get("love");
    const urlTheme = urlParams.get("theme");

    let hasChanges = false;

    if (urlDate && currentState.date !== urlDate) {
      setDate(urlDate);
      hasChanges = true;
    }
    if (urlTime && currentState.time !== urlTime) {
      setTime(urlTime);
      hasChanges = true;
    }
    if (urlLove && currentState.loveMessage !== urlLove) {
      setLoveMessage(urlLove);
      hasChanges = true;
    }
    if (urlTheme === "dark" && !currentState.isDarkMode) {
      setDarkMode(true);
      hasChanges = true;
    } else if (urlTheme !== "dark" && currentState.isDarkMode) {
      setDarkMode(false);
      hasChanges = true;
    }

    return hasChanges;
  }, []);

  // Sync URL from state (State -> URL)
  // This should be called when state changes and you want to update the URL
  const syncUrlFromState = useCallback(() => {
    if (typeof window === "undefined") return;
    if (updatePendingRef.current) return;

    updatePendingRef.current = true;

    try {
      const currentParams = new URLSearchParams(location.search);
      const { date, time, movie, loveMessage, isDarkMode } = useDateStore.getState();

      // Remove managed keys first to preserve non-managed params
      MANAGED_KEYS.forEach((k) => currentParams.delete(k));

      // Set managed keys from current state
      if (date) currentParams.set("date", date);
      if (time) currentParams.set("time", time);
      if (movie) currentParams.set("movie", movie.id.toString());
      if (loveMessage) currentParams.set("love", loveMessage);
      if (isDarkMode) currentParams.set("theme", "dark");

      const query = Object.fromEntries(currentParams.entries());

      navigate({
        to: ".",
        search: query,
        replace: true,
      });
    } finally {
      updatePendingRef.current = false;
    }
  }, [navigate]);

  // Combined sync: reads from URL and updates state, then syncs back if needed
  const sync = useCallback(() => {
    if (typeof window === "undefined") return;

    // First sync state from URL
    const hadUrlChanges = syncStateFromUrl();

    // Then sync URL from state (if state was changed by URL, or if we need to push state to URL)
    // We do this to ensure URL reflects current state
    syncUrlFromState();
  }, [syncStateFromUrl, syncUrlFromState]);

  // Sync on mount
  useEffect(() => {
    sync();
  }, [sync]);

  return {
    /** Sync URL from current Zustand state (State -> URL) */
    syncUrl: syncUrlFromState,
    /** Sync Zustand state from URL (URL -> State) */
    syncState: syncStateFromUrl,
    /** Full sync in both directions */
    sync,
    /** Get current state as search params */
    getSearchParams: buildSearchParamsFromState,
  };
}

/**
 * Creates a shareable URL with current state.
 * This is a standalone utility that doesn't trigger navigation.
 */
export function createShareableUrl(): string {
  const origin = typeof window === "undefined" ? "" : location.origin;

  const { date, time, movie, loveMessage, isDarkMode } = useDateStore.getState();
  const params = new URLSearchParams(typeof window === "undefined" ? "" : location.search);

  if (date) params.set("date", date);
  if (time) params.set("time", time);
  if (movie) params.set("movie", movie.id.toString());
  if (loveMessage) params.set("love", loveMessage);
  if (isDarkMode) params.set("theme", "dark");

  return `${origin}${typeof window === "undefined" ? "/" : location.pathname}${params.toString() ? `?${params}` : ""}`;
}

/**
 * Parses movie ID from URL.
 */
export function getMovieIdFromUrl(): number | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(location.search);
  const movieId = params.get("movie");
  return movieId ? parseInt(movieId, 10) : null;
}
