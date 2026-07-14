import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { STEP_ROUTE, useRouteStep, LOCKED_NAV_ROUTES } from "@/hooks/useRouteStep";

interface StepDef {
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  /** Override the route-derived "active" step. */
  currentStep?: number;
}

/**
 * Stepper — minimal horizontal progress indicator.
 *
 * Site of the active step is the URL alone, so deep-links, refresh,
 * and back/forward continue to render the correct step. Steps below
 * the active one are clickable (you can revisit them); steps beyond
 * are inert. On `LOCKED_NAV_ROUTES` (currently `/success`), all steps
 * are inert except for the "Plan another date" CTA inside the page.
 *
 * Renders as a small horizontal pill, label-led, no decorative noise.
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  const navigate = useNavigate();
  const { currentStep: routeStep, navLocked } = useRouteStep(steps.length);
  const active = Math.max(1, Math.min(currentStep ?? routeStep, steps.length));

  // Lock step navigation on success so the bar doesn't fight the CTA.
  if (
    navLocked &&
    LOCKED_NAV_ROUTES.has(typeof window !== "undefined" ? window.location.pathname : "")
  ) {
    return null;
  }

  return (
    <ol
      aria-label="Date night progress"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:gap-x-3"
    >
      {steps.map((step, idx) => {
        const num = idx + 1;
        const isDone = num < active;
        const isCurrent = num === active;
        const reachable = !navLocked && num <= active;
        const destination = STEP_ROUTE[num];

        return (
          <li key={step.label} className="flex items-center gap-x-2 sm:gap-x-3">
            <button
              type="button"
              disabled={!reachable}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => reachable && navigate({ to: destination })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                reachable ? "hover:text-foreground cursor-pointer" : "cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums",
                  "transition-colors duration-200",
                  isCurrent
                    ? "bg-foreground text-background"
                    : isDone
                      ? "bg-foreground/85 text-background"
                      : "border border-border text-muted-foreground",
                )}
                aria-hidden
              >
                {isDone ? "✓" : num}
              </span>
              <span
                className={cn(
                  "text-xs font-medium tracking-tight",
                  isCurrent && "text-foreground",
                  isDone && "text-foreground/80",
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 ? (
              <span aria-hidden className="h-px w-3 bg-border sm:w-6" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
