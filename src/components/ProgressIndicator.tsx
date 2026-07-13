import { clsx } from "clsx";
import { useRouteStep } from "@/hooks/useRouteStep";

type StepLabel = "Start" | "Date" | "Time" | "Movie" | "Summary" | "Celebrate";

const STEP_LABELS: StepLabel[] = ["Start", "Date", "Time", "Movie", "Summary", "Celebrate"];

interface ProgressIndicatorProps {
  /** Optional override — defaults to the route‑derived step. */
  currentStep?: number;
  /** Optional override for total step count (default 6). */
  totalSteps?: number;
}

export function ProgressIndicator({
  currentStep: currentStepProp,
  totalSteps: totalStepsProp,
}: ProgressIndicatorProps) {
  const { currentStep: routeStep, totalSteps: routeTotal } = useRouteStep(totalStepsProp ?? 6);

  // Falls back to the route‑derived step when no override is given.
  const currentStep = currentStepProp ?? routeStep;
  const totalSteps = totalStepsProp ?? routeTotal;

  // Clamp values
  const step = Math.max(1, Math.min(currentStep, totalSteps));
  const total = Math.max(1, totalSteps);

  return (
    <div className="relative w-full">
      {/* Background line */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-0.5 bg-muted"></div>
      </div>

      {/* Steps */}
      <div className="flex flex-wrap justify-center -mx-1">
        {Array.from({ length: total }, (_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber <= step;
          const isCurrent = stepNumber === step;
          const label: StepLabel = STEP_LABELS[i] ?? `${i + 1}`;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center px-2"
              // Ensure equalSlate
            >
              {/* Dot */}
              <div
                className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full
                transition-all duration-300
                ${
                  isActive
                    ? "border-2 border-primary-foreground bg-primary-foreground"
                    : "border-2 border-muted-foreground bg-transparent"
                }
                ${isCurrent && "animate-pulse"}
              `}
              >
                {isActive && <div className="w-4 h-4 rounded-full bg-primary-foreground" />}
              </div>

              {/* Label */}
              <div
                className={clsx("mt-1.5 text-xs text-center text-muted-foreground", {
                  "font-medium": isCurrent,
                  "font-normal": !isCurrent,
                })}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible label */}
      <div className="sr-only">
        Step {step} of {total}
      </div>
    </div>
  );
}
