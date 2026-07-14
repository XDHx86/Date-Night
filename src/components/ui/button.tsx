import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sound";

/**
 * Button — application-wide action primitive.
 *
 * Three variants × three sizes. No gradients by default; the
 * `primary` variant uses the accent fill for clear hierarchy. All
 * variants render with the same height scale so layouts stay
 * rhythm-stable. Spring interactions are tuned to feel responsive
 * without being loud.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-tight select-none cursor-pointer transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-[var(--shadow-sm)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-foreground/15",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        subtle: "bg-secondary text-secondary-foreground hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-md",
        md: "h-11 px-5 text-[0.95rem] rounded-md",
        lg: "h-14 px-7 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Spring tuning — light, decisive. Tuned so a 1-frame tap feels
 * responsive without triggering the "rubbery toy" effect of heavier
 * springs.
 */
const SPRING = { type: "spring" as const, stiffness: 480, damping: 32 };

/**
 * Click handler wrapper that fires the synthesized UI sound, then
 * delegates to the provided handler. Centralised so the entire app
 * stays in sync without re-implementing it per call site.
 */
function withClickSound<E extends React.MouseEvent>(
  handler: ((e: E) => void) | undefined,
  enabled = true,
) {
  return (e: E) => {
    if (enabled) sounds.click();
    handler?.(e);
  };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, onClick, type, disabled, ...props }, ref) => {
    if (asChild) {
      // Use Slot for cases like wrapping a Link so children inherit
      // styles but we don't get a <button> here. Slot doesn't accept
      // motion props, so we call sounds.click() on the consumer's
      // onClick (it must include the sound or be wrapped).
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(buttonVariants({ variant, size }), className)}
          onClick={withClickSound(onClick)}
          {...(props as Record<string, unknown>)}
        />
      );
    }

    return (
      <motion.button
        ref={ref}
        type={type ?? "button"}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={withClickSound(onClick, !disabled)}
        whileHover={disabled ? undefined : { y: -1 }}
        whileTap={disabled ? undefined : { y: 0, scale: 0.985 }}
        transition={SPRING}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
