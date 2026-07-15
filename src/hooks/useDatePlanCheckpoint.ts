/**
 * Shareable-link checkpoint for the date-plan flow.
 *
 * `/summary` and `/success` are reachable in two ways:
 *  1. The normal climb — the user picked a date, time, and movie, so the
 *     Zustand store already holds the full plan.
 *  2. A shared link — a fresh browser (another person, or a refresh after the
 *     store was cleared) lands here with the plan encoded entirely in the URL
 *     and an *empty* store.
 *
 * Historically these routes only read the store, so case 2 failed: the movie was
 * never restored and the summary's route guard bounced the visitor back to
 * `/date` before any reconstruction was attempted. This hook implements a true
 * checkpoint that rebuilds the missing state from the URL before validating.
 *
 * Restoration priority:
 *   1. Existing application/store state — the baseline where the URL is silent.
 *   2. Reconstruct from URL parameters — `date`/`time`/`love`/`theme` and the
 *      `movie` ID. The URL is authoritative for any value it carries, so a
 *      shared link replays exactly the plan it encodes rather than a stale
 *      local one.
 *   3. Fetch any missing resources from TMDB — when the URL carries a `movie`
 *      ID the store doesn't already have, pull the full object by ID so
 *      posters, backdrops, runtime, and tags hydrate identically to the normal
 *      flow.
 *   4. Hydrate the store with the reconstructed data.
 *   5. Validate the completed state against the route's required fields.
 *   6. Redirect only when required data is genuinely unavailable or invalid
 *      (e.g. the URL's `movie` ID can't be fetched and isn't cached).
 *
 * The hook owns its redirect side effect so a route can't misfire a bounce
 * while a fetch is still in flight.
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useDateStore } from "@/lib/store";
import { getMovieById } from "@/lib/movies";

export type CheckpointStatus = "restoring" | "ready" | "invalid";

export interface DatePlanCheckpointOptions {
  /** Pieces that must be present (after restoration) for the route to render.
   * Defaults to date + time + movie. */
  required?: { date?: boolean; time?: boolean; movie?: boolean };
  /** Where to send the user when required data is genuinely unavailable.
   * Defaults to `/date`, the canonical entry to the planning flow. */
  redirectTo?: string;
}

export interface DatePlanCheckpoint {
  /** True while a TMDB fetch is actually in flight — gate a loader on this. */
  isFetching: boolean;
  /** Final phase once reconstruction has settled. */
  status: CheckpointStatus;
}

interface ParsedUrl {
  date: string | null;
  time: string | null;
  movieId: string | null;
  love: string | null;
  theme: string | null;
  hasTheme: boolean;
}

function parseUrl(search: string): ParsedUrl {
  const params = new URLSearchParams(search);
  return {
    date: params.get("date"),
    time: params.get("time"),
    movieId: params.get("movie"),
    love: params.get("love"),
    theme: params.get("theme"),
    hasTheme: params.has("theme"),
  };
}

/**
 * Decide whether the initial render should already show a loading state because
 * a TMDB fetch will be required to hydrate the movie. Computing this from the
 * URL at init avoids a flash of broken "no movie" UI before the effect runs.
 */
function initialNeedsFetch(parsed: ParsedUrl): boolean {
  if (typeof window === "undefined") return false;
  const wantId = parsed.movieId;
  if (!wantId) return false;
  const have = useDateStore.getState().movie;
  const haveId = have ? String(have.id) : null;
  return haveId !== wantId;
}

/**
 * Checkpoint hook shared by the `/summary` and `/success` routes.
 *
 * Returns `isFetching` (for a loading indicator) and `status`. The redirect on
 * an invalid state happens inside the hook, so callers don't re-implement the
 * guard.
 */
export function useDatePlanCheckpoint(options?: DatePlanCheckpointOptions): DatePlanCheckpoint {
  const required = options?.required ?? { date: true, time: true, movie: true };
  const redirectTo = options?.redirectTo ?? "/date";

  const navigate = useNavigate();
  const location = useLocation();

  // Subscribed slices — these drive validation and rendering once settled.
  const date = useDateStore((s) => s.date);
  const time = useDateStore((s) => s.time);
  const movie = useDateStore((s) => s.movie);

  const setDate = useDateStore((s) => s.setDate);
  const setTime = useDateStore((s) => s.setTime);
  const setMovie = useDateStore((s) => s.setMovie);
  const setLoveMessage = useDateStore((s) => s.setLoveMessage);
  const setDarkMode = useDateStore((s) => s.setDarkMode);

  // `settled` gates the redirect decision: nothing is "invalid" until the
  // restoration effect has had a chance to sync scalars and start (or skip)
  // the movie fetch. This prevents a spurious bounce on the first render.
  const [settled, setSettled] = useState(false);
  // True only while a TMDB fetch is in flight.
  const [fetchingMovie, setFetchingMovie] = useState(() =>
    initialNeedsFetch(parseUrl(location.search)),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const parsed = parseUrl(location.search);
    const state = useDateStore.getState();

    // --- Step 2: reconstruct scalar state from URL ---------------------------
    // The URL is authoritative for any value it carries; the store is the
    // baseline where the URL is silent (so normal in-app navigation with an
    // empty URL keeps the store's plan untouched).
    if (parsed.date && state.date !== parsed.date) setDate(parsed.date);
    if (parsed.time && state.time !== parsed.time) setTime(parsed.time);
    if (parsed.love && state.loveMessage !== parsed.love) setLoveMessage(parsed.love);
    // Only touch theme when the URL explicitly signals it, so a shared link
    // that omitted `theme` never silently overrides the recipient's preference.
    if (parsed.hasTheme) setDarkMode(parsed.theme === "dark");

    // --- Step 3: fetch any missing movie resource from TMDB ------------------
    const wantId = parsed.movieId;
    const haveId = state.movie ? String(state.movie.id) : null;
    const shouldFetch = !!wantId && haveId !== wantId;

    if (shouldFetch && wantId) {
      setFetchingMovie(true);
      setSettled(false);
      getMovieById(wantId)
        .then((data) => {
          if (cancelled) return;
          // Step 4: hydrate the store with the reconstructed resource.
          if (data) setMovie(data);
          setFetchingMovie(false);
          setSettled(true);
        })
        .catch(() => {
          if (cancelled) return;
          // A network/parse failure leaves the movie absent → invalid below.
          setFetchingMovie(false);
          setSettled(true);
        });
    } else {
      setFetchingMovie(false);
      setSettled(true);
    }

    return () => {
      cancelled = true;
    };
  }, [location.search, setDate, setTime, setLoveMessage, setDarkMode, setMovie]);

  // --- Step 5: validate the completed state ---------------------------------
  const missingRequired =
    (!!required.date && !date) || (!!required.time && !time) || (!!required.movie && !movie);

  const status: CheckpointStatus =
    !settled || fetchingMovie ? "restoring" : missingRequired ? "invalid" : "ready";

  // --- Step 6: redirect only when required data is genuinely unavailable ----
  useEffect(() => {
    if (status === "invalid") navigate({ to: redirectTo });
  }, [status, navigate, redirectTo]);

  return { isFetching: fetchingMovie, status };
}
