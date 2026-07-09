import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sound";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 shadow-[var(--shadow-soft)] cursor-pointer select-none",
  {
    variants: {
      variant: {
        yes: "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]",
        no: "bg-card text-muted-foreground border border-border hover:bg-muted",
        gold: "bg-[image:var(--gradient-gold)] text-gold-foreground",
        soft: "bg-secondary text-secondary-foreground hover:bg-accent",
        ghost: "bg-transparent text-primary shadow-none hover:bg-secondary/60",
      },
      size: {
        sm: "h-11 px-6 text-sm",
        md: "h-14 px-8 text-lg",
        lg: "h-16 px-10 text-xl",
      },
    },
    defaultVariants: { variant: "yes", size: "md" },
  },
);

export interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, onClick, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        onClick={(e) => {
          sounds.click();
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";

export { buttonVariants };
