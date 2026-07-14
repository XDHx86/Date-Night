import { forwardRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Backwards-compatible shim around the design-system Button.
 *
 * Routes still import this under the old `yes / no / gold` legacy alias.
 * The headline contract changes the plan cares about live here:
 *
 *   - `yes` renders the signature romance gradient (rose → peach → gold → violet),
 *     so primary "agree" actions lead visually,
 *   - `size="lg"` is the tall hero size (h-16) via the Button size system.
 *
 * New pages should import `Button` from `@/components/ui/button` directly and
 * use the canonical variants (`primary | outline | ghost | subtle`).
 */
export type AnimatedButtonVariant = "yes" | "no" | "gold" | "soft" | "ghost";

/** Variant → { Button variant, extra classes (gradient/foreground/glow) }. */
const mapping: Record<
  AnimatedButtonVariant,
  { variant: ButtonProps["variant"]; className: string }
> = {
  // The romance gradient fill — keep the foreground readable on the warm mesh.
  yes: {
    variant: undefined,
    className:
      "bg-[image:var(--gradient-romance)] text-primary-foreground hover:brightness-[1.04] shadow-[var(--shadow-glow)]",
  },
  no: { variant: "outline", className: "" },
  gold: { variant: "ghost", className: "" },
  soft: { variant: "subtle", className: "" },
  ghost: { variant: "ghost", className: "" },
};

export interface AnimatedButtonProps
  extends
    Omit<HTMLMotionProps<"button">, "ref" | "children">,
    Omit<ButtonProps, "variant" | "size"> {
  variant?: AnimatedButtonVariant;
  size?: ButtonProps["size"];
  children?: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "yes", size = "md", type, ...props }, ref) => {
    const { variant: buttonVariant, className: variantClassName } = mapping[variant];
    return (
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={buttonVariant}
        size={size}
        className={cn(variantClassName, className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";
