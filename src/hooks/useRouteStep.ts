import { useLocation } from "@tanstack/react-router";

/**
 * Maps each route to its progress step. The step number reflects the
 * user's position in the date‑planning flow rather than a literal page
 * count, so several routes can share a single step (the movie picker,
 * summary, success and love letter all live on step 6).
 *
 * The URL — **not** component state — is the source of truth. The active
 * route therefore stays correct after refreshes, deep links, and
 * forward/back navigation.
 */
export const ROUTE_STEP: Record<string, number> = {
  "/": 1,
  // "/begging": 1,
  // "/confirmation": 1,
  "/date": 2,
  "/time": 3,
  "/movie": 4,
  "/summary": 5,
  "/success": 6,
  // "/love-letter": 1,
};

/**
 * Canonical entry route for every step. Used by the persistent progress
 * bar when the user clicks a previously reachable step — we send them
 * to the start‑of‑step route so they can revise that step's answer.
 */
export const STEP_ROUTE: Record<number, string> = {
  1: "/",
  2: "/begging",
  3: "/confirmation",
  4: "/date",
  5: "/time",
  6: "/movie",
};

/**
 * Routes from which progress‑bar navigation is intentionally disabled.
 * The success page is terminal; "Plan another date" is the only escape.
 */
export const LOCKED_NAV_ROUTES: ReadonlySet<string> = new Set(["/success"]);

interface ProgressStep {
  /** Step number for the *currently rendered* route (URL‑derived). */
  currentStep: number;
  /** Total number of steps in the flow. */
  totalSteps: number;
  /** Active route pathname: "/", "/date", "/success", … */
  currentPath: string;
  /** True when progress‑bar back‑navigation is intentionally disabled. */
  navLocked: boolean;
}

/**
 * Returns the current progress step derived from the active route.
 * Always clamped to `totalSteps`.
 */
export function useRouteStep(totalSteps = 6): ProgressStep {
  const location = useLocation();
  const raw = ROUTE_STEP[location.pathname] ?? 1;
  const currentStep = Math.min(Math.max(raw, 1), totalSteps);

  return {
    currentStep,
    totalSteps,
    currentPath: location.pathname,
    navLocked: LOCKED_NAV_ROUTES.has(location.pathname),
  };
}
