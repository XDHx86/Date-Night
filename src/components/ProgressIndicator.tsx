import { ProgressCircle } from "./ProgressCircle";

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex h-4 w-full rounded-full bg-muted">
        <div
          className="flex-1 h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M0,0 H100 V100 H0 Z%22 fill=%22%2300000000%22 stroke=%22%23ffffff%22 stroke-width=%224%22/%22></svg>')]
          background-size:cover
          background-repeat:no-repeat
          background-position:left
          background-origin:content-box
          background-clip:content-box
          mask-image:linear-gradient(to right, black 0%, black var(--mask-position), transparent var(--mask-position))
          mask-size:200% 100%
          mask-position:{{progressPercent}}% 0
          transition:mask-position 0.3s ease
          style={{ "--mask-position": `${progressPercent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{["Start", "Date", "Time", "Movie", "Summary", "Celebrate"][currentStep - 1] || ""}</span>
      </div>
    </div>
  );
}

// Simple circular progress indicator as an alternative
function ProgressCircle({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = (currentStep - 1) / (totalSteps - 1);
  const dashed = `(${2 * Math.PI * 24}s) ${2 * Math.PI * 24 * (1 -
      progress)}`;
  return (
    <div className="relative h-10 w-10">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          strokeWidth="4"
          stroke="hsl(var(--border))"
        />
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          strokeWidth="4"
          stroke="hsl(var(--primary))"
          strokeDasharray="141.3"
          strokeDashoffset={dashed}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {currentStep}/{totalSteps}
      </div>
    </div>
  );
}