import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { format, parseISO, addDays } from "date-fns";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { Field, DateInput } from "@/components/ui/field";
import { Chip } from "@/components/ui/chip";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useUrlSync } from "@/hooks/useUrlSync";

export const Route = createFileRoute("/date")({
  component: DatePickerPage,
});

const ISO = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Date picker — quick chips first, the day-of-week confirmation
 * below, then a precise picker if neither of those suits. Renders
 * a single preview line of the chosen day so the user always sees
 * what they're about to commit to.
 */
function DatePickerPage() {
  const navigate = useNavigate();
  const { date, setDate } = useDateStore();
  const [value, setValue] = useState(date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);

  const { syncUrl, syncState } = useUrlSync();
  const dateMessage = useRandomMessage("date");

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    if (date && date !== value) setValue(date);
  }, [date, value]);

  useEffect(() => {
    setToday(ISO(new Date()));
  }, []);

  useEffect(() => {
    if (value) {
      setDate(value);
      syncUrl();
    }
  }, [value, setDate, syncUrl]);

  const quickDates = useMemo(() => {
    if (!today) return [] as { label: string; dateStr: string }[];
    const base = new Date(today);
    return [
      { label: "Today", dateStr: today },
      { label: "Tomorrow", dateStr: ISO(addDays(base, 1)) },
      { label: "Day after", dateStr: ISO(addDays(base, 2)) },
      { label: "Next week", dateStr: ISO(addDays(base, 7)) },
    ];
  }, [today]);

  const submit = useCallback(() => {
    if (!value) {
      setError("Pick a day for our date.");
      return;
    }
    if (today && value < today) {
      setError("Pick a day that hasn't happened yet.");
      return;
    }
    setDate(value);
    syncUrl();
    setTimeout(() => navigate({ to: "/time" }), 0);
  }, [value, today, setDate, syncUrl, navigate]);

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
    <PageShell width="default">
      <Eyebrow>Step 2 — Date</Eyebrow>

      <h1 className="text-display text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl">
        Pick a night that works.
      </h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        When can I take you out?
      </p>

      {dateMessage ? (
        <p className="mt-6 max-w-sm text-xs italic text-muted-foreground/80">{dateMessage}</p>
      ) : null}

      <div className="mt-10 flex w-full max-w-md flex-col gap-6">
        <Field id="date" label="Date" hint="Or pick a precise day of your own.">
          <DateInput
            id="date"
            min={today ?? undefined}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
          />
        </Field>

        <div className="flex flex-col gap-2.5">
          <span className="text-eyebrow">Quick picks</span>
          <div className="flex flex-wrap gap-2">
            {quickDates.map(({ label, dateStr }) => (
              <Chip
                key={label}
                selected={value === dateStr}
                onSelect={() => handleDateSelect(dateStr)}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {value && !error ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display text-2xl tracking-tight text-foreground"
          >
            {format(parseISO(value), "EEEE, MMMM do, yyyy")}
          </motion.p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <Button size="lg" variant="primary" className="mt-10 w-full max-w-md" onClick={submit}>
        Continue
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </PageShell>
  );
}
