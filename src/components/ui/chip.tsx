import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sound";

interface ChipProps extends Omit<HTMLMotionProps<"button">, "ref" | "prefix" | "children"> {
  selected?: boolean;
  onSelect?: () => void;
  /** Optional leading icon or emoji. */
  prefix?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Chip — selection pill used for quick-choice lists (today/tomorrow,
 * 7pm/9pm, recommended/classic).
 *
 * Renders as a button regardless of `selected` state so the
 * interaction is consistent — keyboard users always have something
 * focusable.
 *
 * Selection state is communicated through border + inner fill, not
 * size, to keep layout stable.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, onSelect, prefix, className, children, onClick, type, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type ?? "button"}
        onClick={(e) => {
          sounds.click();
          onSelect?.();
          onClick?.(e);
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium select-none cursor-pointer transition-colors duration-150 ease-out",
          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:bg-secondary hover:border-foreground/15",
          className,
        )}
        aria-pressed={selected}
        {...props}
      >
        {prefix ? <span className="-ml-0.5">{prefix}</span> : null}
        <span>{children}</span>
      </motion.button>
    );
  },
);
Chip.displayName = "Chip";
