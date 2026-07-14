import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sound";

/**
 * Button — application-wide action primitive.
 *
 * Variants × sizes share one height scale so layouts stay rhythm-stable.
 * The `primary` variant carries a soft static rose glow so hero actions get
 * their halo without per-call-site work; the *pulsing* glow is opt-in via an
 * `animate-glow` className on the showpiece CTAs (summary/success). Spring
 * interactions are tuned to feel responsive without being loud — a decisive
 * squish on tap, a gentle lift on hover.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-tight select-none cursor-pointer transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-[var(--shadow-glow)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-foreground/15",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        subtle: "bg-secondary text-secondary-foreground hover:bg-accent",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-xl",
        md: "h-11 px-5 text-[0.95rem] rounded-xl",
        lg: "h-16 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Play a soft twinkle on hover (opt-in — heroes only, to avoid chatter). */
  hoverSound?: boolean;
}

/**
 * Spring tuning — light, decisive. Tuned so a 1-frame tap feels
 * responsive without triggering the "rubbery toy" effect of heavier
 * springs.
 */
const SPRING = { type: "spring" as const, stiffness: 480, damping: 30 };

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
  (
    {
      className,
      variant,
      size,
      asChild,
      hoverSound,
      onClick,
      onMouseEnter,
      type,
      disabled,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(buttonVariants({ variant, size }), className)}
          onClick={withClickSound(onClick)}
          onMouseEnter={
            hoverSound
              ? (e) => {
                  sounds.twinkle();
                  (onMouseEnter as unknown as ((e: React.MouseEvent) => void) | undefined)?.(e);
                }
              : onMouseEnter
          }
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
        whileTap={disabled ? undefined : { scale: 0.94 }}
        transition={SPRING}
        onMouseEnter={
          hoverSound
            ? (e) => {
                sounds.twinkle();
                onMouseEnter?.(e);
              }
            : onMouseEnter
        }
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
