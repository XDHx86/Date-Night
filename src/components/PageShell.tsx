import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  /** Maximum width of the inner column. Defaults to ~reading length. */
  width?: "narrow" | "default" | "wide";
  /** When true, align the column to the start instead of the center. */
  align?: "start" | "center";
  className?: string;
}

const WIDTH: Record<NonNullable<PageShellProps["width"]>, string> = {
  narrow: "max-w-md",
  default: "max-w-xl",
  wide: "max-w-3xl",
};

/**
 * Shared page layout — the single layout primitive used by every route.
 *
 * Reserves vertical space at the top and bottom of the viewport for the
 * persistent chrome (progress bar above, control bar below) and lets
 * each route keep one consistent vertical rhythm. The fade/slide enter
 * animation reads as a soft page-change pulse; exits are handled by
 * TanStack Router's default unmount.
 */
export function PageShell({
  children,
  width = "default",
  align = "center",
  className,
}: PageShellProps) {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden px-5 pt-24 pb-28 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative z-10 flex w-full flex-col",
          WIDTH[width],
          align === "center" && "items-center text-center",
          className,
        )}
      >
        {children}
      </motion.div>
    </main>
  );
}
