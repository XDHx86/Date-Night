import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format, parse } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";

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

  // Guard: if someone deep-links here without a date, send them back.
  if (!date && typeof window !== "undefined") {
    navigate({ to: "/date" });
  }

  const submit = () => {
    if (!value) {
      setError("Pick a time so I know when to be ready 🥹");
      return;
    }
    setTime(value);
    navigate({ to: "/movie" });
  };

  return (
    <PageShell particles={12}>
      <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-9">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
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
              setValue(e.target.value);
              setError(null);
            }}
            className="w-full rounded-2xl border border-input bg-background px-4 py-4 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setValue(t);
                  setError(null);
                }}
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

          {value && !error && (
            <p className="mt-4 text-center text-lg font-semibold text-primary">
              See you at {pretty(value)} 💫
            </p>
          )}
          {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}
        </div>

        <AnimatedButton variant="yes" size="md" className="mt-7 w-full" onClick={submit}>
          Next <ArrowRight className="h-5 w-5" />
        </AnimatedButton>
      </div>
    </PageShell>
  );
}
