/**
 * Storage utilities for synchronizing state with localStorage and URL parameters
 */

import { useDateStore } from "./store";

/**
 * Synchronizes date plan state with URL query parameters
 * Format: ?date=YYYY-MM-DD&time=HH:MM&movie=movieId
 */
export const syncUrlWithState = () => {
  if (typeof window === "undefined") return;

  const { date, time, movie, setDate, setTime, setMovie } = useDateStore.getState();
  const urlParams = new URLSearchParams(window.location.search);

  // Update state from URL parameters
  const urlDate = urlParams.get("date");
  const urlTime = urlParams.get("time");
  const urlMovieId = urlParams.get("movie");

  if (urlDate && date !== urlDate) {
    setDate(urlDate);
  }
  if (urlTime && time !== urlTime) {
    setTime(urlTime);
  }
  if (urlMovieId && movie) {
    // Note: We can't directly set movie by ID without fetching it
    // This would require movie service integration
    // For now, we'll handle this in the movie service when it loads
  }

  // Update URL from state (when state changes)
  const updateUrlFromState = () => {
    const newParams = new URLSearchParams();
    if (date) newParams.set("date", date);
    if (time) newParams.set("time", time);
    if (movie) newParams.set("movie", movie.id.toString());

    const newUrl = `${window.location.pathname}${newParams.toString() ? `?${newParams}` : ""}`;
    window.history.replaceState({ ...window.history.state }, "", newUrl);
  };

  // Listen for state changes and update URL
  // We'll use a subscription approach - in practice, this would be done
  // through a middleware or by calling this function in useEffect in components
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
 */
export const createShareableUrl = (): string => {
  if (typeof window === "undefined") return window.location.origin;

  const { date, time, movie } = useDateStore.getState();
  const params = new URLSearchParams(window.location.search);

  if (date) params.set("date", date);
  if (time) params.set("time", time);
  if (movie) params.set("movie", movie.id.toString());

  return `${window.location.pathname}${params.toString() ? ` =>
      ? `?${params}` : ""
    }`;
};