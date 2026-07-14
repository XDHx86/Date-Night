import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Spacing scale used by Stack. Keep it tight — there is rarely
 * a reason to invent a new rhythm mid-flow.
 */
const GAP: Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 14 | 16 | 20, string> = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
  12: "gap-12",
  14: "gap-14",
  16: "gap-16",
  20: "gap-20",
};

const COL_ALIGN: Record<"start" | "center" | "end" | "stretch", string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const ROW_ALIGN: Record<"start" | "center" | "end" | "stretch", string> = {
  start: "items-start justify-start",
  center: "items-center justify-center",
  end: "items-end justify-end",
  stretch: "items-stretch justify-start",
};

/**
 * Surface — the universal container for grouped content.
 *
 * Single primitive, no decoration by default. Pads are intentional
 * (`tight` for dense lists, `default` for most cards, `loose` for
 * hero blocks). Elevation is opt-in via `elevate`.
 */
export const Surface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    pad?: "none" | "tight" | "default" | "loose";
    elevate?: boolean;
    /** Opt into the translucent glass surface; default stays solid to avoid contrast regressions. */
    glass?: boolean;
  }
>(({ className, pad = "default", elevate = false, glass: useGlass = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg text-card-foreground",
      useGlass ? "glass" : "border border-border bg-card",
      pad === "tight" && "p-4",
      pad === "default" && "p-6 sm:p-7",
      pad === "loose" && "p-8 sm:p-10",
      elevate && "shadow-[var(--shadow-md)]",
      className,
    )}
    {...props}
  />
));
Surface.displayName = "Surface";

/**
 * Stack — vertical or horizontal layout primitive with consistent
 * rhythm. Defaults to a column at `gap-4`, items stretched.
 */
export function Stack({
  children,
  gap = 4,
  direction = "column",
  align = "stretch",
  className,
}: {
  children: React.ReactNode;
  gap?: keyof typeof GAP;
  direction?: "row" | "column";
  align?: keyof typeof COL_ALIGN;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row flex-wrap",
        GAP[gap],
        direction === "column" ? COL_ALIGN[align] : ROW_ALIGN[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
