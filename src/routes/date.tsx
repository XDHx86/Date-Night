import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { format, parseISO, addDays } from "date-fns";
import { CalendarHeart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useUrlSync } from "@/hooks/useUrlSync";

export const Route = createFileRoute("/date")({
  component: DatePickerPage,
});

function formatToday(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function DatePickerPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { date, setDate } = useDateStore();
  const [value, setValue] = useState(date ?? "");
  const [error, setError] = useState<string | null>(null);
  // `today` is computed on the client‑only after hydration to avoid a
  // server/client timezone mismatch on the first render.
  const [today, setToday] = useState<string | null>(null);

  // Use centralized URL sync
  const { syncUrl, syncState } = useUrlSync();

  const dateMessage = useRandomMessage("date");

  // Log router state for debugging
  useEffect(() => {
    console.log("Router location:", router.state.location);
  }, [router.state.location]);

  // Sync URL with state on mount
  useEffect(() => {
    syncState();
  }, [syncState]);

  // Sync value with store state
  useEffect(() => {
    if (date && date !== value) {
      setValue(date);
    }
  }, [date, value]);

  // Compute `today` **after** mount so SSR and first client render match.
  useEffect(() => {
    setToday(formatToday(new Date()));
  }, []);

  // Sync URL when local value changes
  useEffect(() => {
    if (value) {
      setDate(value);
      syncUrl();
    }
  }, [value, setDate, syncUrl]);

  const submit = useCallback(() => {
    if (!value) {
      setError("Pick a day for our date 🥰");
      return;
    }
    if (today && value < today) {
      setError("Let's pick a day that hasn't happened yet 😅");
      return;
    }
    setDate(value);
    syncUrl();
    // Use setTimeout to ensure state is updated before navigation
    // This prevents race conditions
    setTimeout(() => {
      navigate({ to: "/time" });
    }, 0);
  }, [value, today, setDate, syncUrl, navigate]);

  // Quick date chips – only built once `today` is known (post‑hydration).
  const dateChips = useMemo(() => {
    if (!today) return [] as { label: string; dateStr: string }[];
    const base = new Date(today);
    return [
      { label: "Today", dateStr: today },
      { label: "Tomorrow", dateStr: format(addDays(base, 1), "yyyy-MM-dd") },
      { label: "Day After", dateStr: format(addDays(base, 2), "yyyy-MM-dd") },
      { label: "Next Week", dateStr: format(addDays(base, 7), "yyyy-MM-dd") },
    ];
  }, [today]);

  const handleDateSelect = useCallback(
    (dateStr: string) => {
      setValue(dateStr);
      setDate(dateStr);
      syncUrl();
      setError(null);
    },
    [setDate, syncUrl],
  );

  return (
    <PageShell>
      {dateMessage && (
        <p className="mb-4 text-center text-muted-foreground italic max-w-xl">"{dateMessage}"</p>
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
            min={today ?? undefined}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              setValue(val);
              setError(null);
            }}
            className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {dateChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {dateChips.map(({ label, dateStr }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleDateSelect(dateStr)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    value === dateStr
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {value && !error && (
          <p className="mt-3 text-center text-lg font-semibold text-primary">
            {format(parseISO(value), "EEEE, MMMM do yyyy")} 💕
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
