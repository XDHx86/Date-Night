import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

/**
 * Field — labelled form control wrapper that pairs a label + control +
 * optional hint/error text. Owns the association via `htmlFor` so the
 * inner control only needs the matching `id`.
 */
export function Field({ label, hint, error, className, children, id }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-eyebrow text-foreground/80">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * TextInput — bare input control with consistent typography.
 *
 * Visual styling lives in `.input-base`; the export here keeps the
 * standalone API while letting `Field` reuse the same class.
 */
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "input-base",
      "h-12 px-4 text-base font-medium text-foreground placeholder:text-muted-foreground/80",
      className,
    )}
    {...props}
  />
));
TextInput.displayName = "TextInput";

/**
 * TimeInput / DateInput — type variants of TextInput with consistent
 * styling across browsers. The native control is preserved so mobile
 * pickers still work; only the chrome is restyled.
 */
export const DateInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    type="date"
    className={cn("font-mono text-[0.95rem]", className)}
    {...props}
  />
));
DateInput.displayName = "DateInput";

export const TimeInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    type="time"
    className={cn("font-mono text-[0.95rem]", className)}
    {...props}
  />
));
TimeInput.displayName = "TimeInput";

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "input-base",
      "min-h-[8rem] px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/80",
      className,
    )}
    {...props}
  />
));
TextArea.displayName = "TextArea";
