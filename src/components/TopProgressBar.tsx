import {
  CalendarHeart,
  Clock,
  Film,
  Heart,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { STEP_ROUTE, useRouteStep } from "@/hooks/useRouteStep";

/* ----------------------------------------------------------------------------
 *  Page‑specific icons + labels for the persistent progress bar.
 *  Edit this table to re‑theme the indicator (icons, order, labels).
 * ------------------------------------------------------------------------- */

interface StepDef {
  label: string;
  Icon: LucideIcon;
  /** Short helper used by screen readers / tooltips. */
  hint: string;
}

const STEP_DEFS: StepDef[] = [
  { label: "Start",     Icon: Heart,         hint: "Invite" },
  { label: "Date",      Icon: CalendarHeart, hint: "Pick a day" },
  { label: "Time",      Icon: Clock,         hint: "Pick a time" },
  { label: "Movie",     Icon: Film,          hint: "Choose a movie" },
  { label: "Summary",   Icon: Sparkles,      hint: "Review the plan" },
  { label: "Celebrate", Icon: PartyPopper,   hint: "All set!" },
];

/**
 * Persistent, layout‑level progress indicator.
 *
 * - Lives at the app root, outside of any route content.
 * - Reads the *active* step directly from the URL (`useRouteStep`):
 *   it stays synchronised across navigation, refreshes, deep links,
 *   and browser back/forward without any per‑page wiring.
 * - Each step is a button that returns the user to that step's start.
 *   - Steps `<= current` are reachable.
 *   - Steps `> current` are blocked (the prerequisite data isn't set).
 *   - On `/success` every navigation is locked — only the in‑page
 *     "Plan another date" CTA can restart the flow.
 *
 * The bar is **fixed** at the top of the viewport and floats above the
 * background layer.
 */
export function TopProgressBar() {
  const navigate = useNavigate();
  const { currentStep, totalSteps, navLocked } = useRouteStep(STEP_DEFS.length);
  // Clamp the step value defensively.
  const active = Math.max(1, Math.min(currentStep, totalSteps));

  return (
    <nav
      aria-label="Date night progress"
      className="pointer-events-none fixed inset-x-0 top-3 z-30 flex justify-center px-3"
    >
      <ol
        className="pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full border border-border/40 bg-card/80 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-md sm:gap-3 sm:px-4"
      >
        {STEP_DEFS.slice(0, totalSteps).map((step, idx) => {
          const num = idx + 1;
          const isDone = num < active;
          const isCurrent = num === active;
          // Reachable when the user has been here before (or is here now)
          // AND the page hasn't intentionally locked progress navigation.
          const isReachable = !navLocked && num <= active;
          const destination = STEP_ROUTE[num];

          const ariaLabel = isCurrent
            ? `Current step: ${step.label} (step ${num} of ${totalSteps})`
            : navLocked
              ? `Step ${num}: ${step.label} (locked — use Plan another date to start over)`
              : isReachable
                ? `Step ${num}: ${step.label} (jump back to this step)`
                : `Step ${num}: ${step.label} (not available yet)`;

          return (
            <li key={step.label} className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                disabled={!isReachable}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={ariaLabel}
                title={
                  isCurrent
                    ? step.hint
                    : navLocked
                      ? "Locked"
                      : isReachable
                        ? `Go back to ${step.label}`
                        : step.hint
                }
                onClick={() => {
                  if (!isReachable) return;
                  navigate({ to: destination });
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9 ${
                  isCurrent
                    ? "scale-110 bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-md"
                    : isDone
                      ? "bg-primary/80 text-primary-foreground"
                      : "border-2 border-muted-foreground/40 bg-background text-muted-foreground"
                } ${
                  isReachable
                    ? "cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95"
                    : "cursor-not-allowed opacity-90"
                } `}
              >
                <step.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
             </button>

              {/* Label: visible on >= sm */}
              <span
                className={`hidden text-xs font-medium uppercase tracking-wide sm:inline ${
                  isCurrent
                    ? "text-foreground"
                    : isDone
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
             </span>

              {/* Connector bar */}
              {idx < totalSteps - 1 && (
                <span
                  aria-hidden
                  className={`h-0.5 w-3 rounded-full transition-colors duration-300 sm:w-8 ${
                    num < active ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
           </li>
          );
        })}
     </ol>
   </nav>
  );
}
