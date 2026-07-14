import { forwardRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Backwards-compatible shim around the new design-system Button.
 *
 * Routes still import this component under the alias that previously
 * carried the gradient `yes / gold / no` styling — the variants here
 * map to the new visual language so existing pages can adopt the
 * redesign without changing every call site.
 *
 * New pages should import `Button` from `@/components/ui/button`
 * directly and use the canonical variants (`primary | outline | ghost
 * | subtle`).
 */
export type AnimatedButtonVariant = "yes" | "no" | "gold" | "soft" | "ghost";

const mapping: Record<AnimatedButtonVariant, ButtonProps["variant"]> = {
  yes: "primary",
  no: "outline",
  gold: "ghost",
  soft: "subtle",
  ghost: "ghost",
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
    return (
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={mapping[variant]}
        size={size}
        className={cn(className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";
