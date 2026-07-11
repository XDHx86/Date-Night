import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { format, parse } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useUrlSync } from "@/hooks/useUrlSync";

export const Route = createFileRoute("/time")({
  component: TimePickerPage,
});

const QUICK = ["18:00", "19:30", "20:00", "21:00"];

function pretty(time: string) {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

function TimePickerPage() {
  const navigate = useNavigate();
  const { time, setTime, date } = useDateStore();
  const [value, setValue] = useState(time ?? "");
  const [error, setError] = useState<string | null>(null);

  // Use centralized URL sync
  const { syncUrl, syncState } = useUrlSync();

  // Sync state from URL on mount
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Sync local value with store state
  useEffect(() => {
    if (time && time !== value) {
      setValue(time);
    }
  }, [time, value]);

  // Sync URL when local value changes
  useEffect(() => {
    if (value) {
      setTime(value);
      syncUrl();
    }
  }, [value, setTime, syncUrl]);

  // Guard: if someone deep-links here without a date, send them back.
  // Use useEffect to avoid render-time side effects
  useEffect(() => {
    if (!date) {
      navigate({ to: "/date" });
    }
  }, [date, navigate]);

  const submit = useCallback(() => {
    if (!value) {
      setError("Pick a time so I know when to be ready 🥹");
      return;
    }
    setTime(value);
    syncUrl();
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      navigate({ to: "/movie" });
    }, 0);
  }, [value, setTime, syncUrl, navigate]);

  // Get a time-related message
  const timeMessage = useRandomMessage("time");

  // Quick time chip selection
  const handleQuickSelect = useCallback(
    (t: string) => {
      setValue(t);
      setTime(t);
      syncUrl();
      setError(null);
    },
    [setTime, syncUrl],
  );

  return (
    <PageShell>
      {timeMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">"{timeMessage}"</p>
      )}

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-9"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gradient">Pick a time</h1>
        <p className="mt-2 text-muted-foreground">What time should our date begin? ⏰</p>

        <div className="mt-6 text-left">
          <label htmlFor="time" className="mb-2 block text-sm font-bold text-card-foreground">
            Time
          </label>
          <input
            id="time"
            type="time"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              setValue(val);
              setError(null);
            }}
            className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleQuickSelect(t)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  value === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {pretty(t)}
              </button>
            ))}
          </div>
        </div>

        {value && !error && (
          <p className="mt-4 text-center text-lg font-semibold text-primary">
            See you at {pretty(value)} 💫
          </p>
        )}
        {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
      </motion.div>

      <AnimatedButton variant="yes" size="md" className="mt-7 w-full" onClick={submit}>
        Next <ArrowRight className="h-5 w-5" />
      </AnimatedButton>
    </PageShell>
  );
}
