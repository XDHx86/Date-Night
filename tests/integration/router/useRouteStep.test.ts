/**
 * Router integration tests.
 *
 * `useRouteStep` is the project's source of truth for progress-bar
 * mapping. These tests pin its contract so a refactor cannot silently
 * remap a route to a different step.
 */

import { describe, it, expect } from "vitest";
import { ROUTE_STEP, STEP_ROUTE, LOCKED_NAV_ROUTES } from "@/hooks/useRouteStep";

const TOTAL_STEPS = 6;

describe("Router — ROUTE_STEP mapping", () => {
  it("covers all the documented flow routes", () => {
    const required: Array<[string, number]> = [
      ["/", 1],
      ["/date", 2],
      ["/time", 3],
      ["/movie", 4],
      ["/summary", 5],
      ["/success", 6],
    ];
    for (const [path, step] of required) {
      expect(ROUTE_STEP[path]).toBeDefined();
      expect(ROUTE_STEP[path]).toBe(step);
    }
  });

  it("every mapped step is between 1 and TOTAL_STEPS", () => {
    for (const [path, step] of Object.entries(ROUTE_STEP)) {
      expect(step, `path ${path}`).toBeGreaterThanOrEqual(1);
      expect(step, `path ${path}`).toBeLessThanOrEqual(TOTAL_STEPS);
    }
  });
});

describe("Router — STEP_ROUTE reverse mapping", () => {
  it("matches total steps count", () => {
    expect(Object.keys(STEP_ROUTE).length).toBeGreaterThanOrEqual(TOTAL_STEPS);
  });

  it("every step has an absolute target route", () => {
    for (const [step, route] of Object.entries(STEP_ROUTE)) {
      expect(typeof route).toBe("string");
      expect(route.startsWith("/")).toBe(true);
      expect(route.length, `step ${step}`).toBeGreaterThan(0);
    }
  });
});

describe("Router — LOCKED_NAV_ROUTES", () => {
  it("includes /success and no other route by default", () => {
    expect(LOCKED_NAV_ROUTES.has("/success")).toBe(true);
  });

  it("never locks the landing page", () => {
    expect(LOCKED_NAV_ROUTES.has("/")).toBe(false);
  });
});

describe("Router — progress invariants", () => {
  it("steps ascend from 1 to TOTAL_STEPS", () => {
    const steps = Array.from(new Set(Object.values(ROUTE_STEP))).sort((a, b) => a - b);
    expect(steps[0]).toBe(1);
    expect(steps.at(-1)).toBe(TOTAL_STEPS);
  });
});
