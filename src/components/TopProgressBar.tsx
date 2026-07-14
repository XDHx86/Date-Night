import { Stepper } from "@/components/ui/stepper";

const STEPS = [
  { label: "Invite" },
  { label: "Date" },
  { label: "Time" },
  { label: "Movie" },
  { label: "Plan" },
  { label: "Done" },
];

/**
 * Lock-screen progress bar.
 *
 * Lives at the application root so it never remounts across route
 * changes. The active step is derived from the URL — see
 * `useRouteStep` — so refresh, deep links, and back/forward all
 * stay in sync without any per-page wiring.
 *
 * On `/success` the bar hides itself; the in-page "Plan another
 * date" CTA owns restarting the flow.
 */
export function TopProgressBar() {
  return (
    <nav
      aria-label="Date night progress"
      className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-3 sm:top-5"
    >
      <div className="pointer-events-auto inline-flex rounded-full px-3 py-2 shadow-[var(--shadow-md)] glass-strong sm:px-4">
        <Stepper steps={STEPS} />
      </div>
    </nav>
  );
}
