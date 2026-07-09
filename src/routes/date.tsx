import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarHeart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";
import { ProgressIndicator } = "/components/ProgressIndicator";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Route = createFileRoute("/date")({
  component: DatePickerPage,
});

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

function DatePickerPage() {
  const navigate = useNavigate();
  const { date, setDate, setStep } = useDateStore();
  const [value, setValue] = useState(date ?? "");
  const [error, setError] = useState<string | null>(null);

  // Set current step (date is step 4)
  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const submit = () => {
    if (!value) {
      setError("Pick a day for our date 🥰");
      return;
    }
    if (value < todayISO()) {
      setError("Let's pick a day that hasn't happened yet 😅");
      return;
    }
    setDate(value);
    navigate({ to: "/time" });
  };

  // Get a date-related message
  const dateMessage = useRandomMessage("date");

  return (
    <PageShell>
      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      {/* Progress Indicator */}
      <div className="mb-4">
        <ProgressIndicator currentStep={4} totalSteps={6} />
      </div>

      {dateMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">
          "{dateMessage}"
        </p>
      )}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-9"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
          <CalendarHeart className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gradient">Pick our date</h1>
        <p className="mt-2 text-muted-foreground">When can I take you out? ❤️</p>

        <div className="mt-6 text-left">
          <label htmlFor="date" className="mb-2 block text-sm font-bold text-card-foreground">
            Date
          </label>
          <input
            id="date"
            type="date"
            min={todayISO()}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {value && !error && (
            <p className="mt-3 text-center text-lg font-semibold text-primary">
              {format(parseISO(value), "EEEE, MMMM do yyyy")} 💕
            </p>
          )}
          {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
        </div>

        <AnimatedButton variant="yes" size="md" className="mt-7 w-full" onClick={submit}>
          Next <ArrowRight className="h-5 w-5" />
        </AnimatedButton>
      </motion.div>
    </PageShell>
  );
}