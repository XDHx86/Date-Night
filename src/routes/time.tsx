import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { format, parse } from "date-fns";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { Button } from "@/components/ui/button";
import { Field, TimeInput } from "@/components/ui/field";
import { Chip } from "@/components/ui/chip";
import { useDateStore } from "@/lib/store";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { useUrlSync } from "@/hooks/useUrlSync";

export const Route = createFileRoute("/time")({
  component: TimePickerPage,
});

const QUICK = ["18:00", "19:00", "19:30", "20:00", "21:00"];

function pretty(time: string) {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

/**
 * Time picker — quick chips for the common evening slots, and a
 * precise input if the user wants something exact. Big preview of
 * the chosen time below so the user can double-check before moving
 * on.
 */
function TimePickerPage() {
  const navigate = useNavigate();
  const { time, setTime, date } = useDateStore();
  const [value, setValue] = useState(time ?? "");
  const [error, setError] = useState<string | null>(null);

  const { syncUrl, syncState } = useUrlSync();

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    if (time && time !== value) setValue(time);
  }, [time, value]);

  useEffect(() => {
    if (value) {
      setTime(value);
      syncUrl();
    }
  }, [value, setTime, syncUrl]);

  // Deep-link guard — if no date was picked, route back.
  useEffect(() => {
    if (!date) navigate({ to: "/date" });
  }, [date, navigate]);

  const submit = useCallback(() => {
    if (!value) {
      setError("Pick a time so I know when to be ready.");
      return;
    }
    setTime(value);
    syncUrl();
    setTimeout(() => navigate({ to: "/movie" }), 0);
  }, [value, setTime, syncUrl, navigate]);

  const timeMessage = useRandomMessage("time");

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
    <PageShell width="default">
      <Eyebrow>Step 3 — Time</Eyebrow>

      <h1 className="text-display text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl">
        What time should I arrive?
      </h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        Common evening windows to start, or pick a precise one.
      </p>

      {timeMessage ? (
        <p className="mt-6 max-w-sm text-xs italic text-muted-foreground/80">{timeMessage}</p>
      ) : null}

      <div className="mt-10 flex w-full max-w-md flex-col gap-6">
        <Field id="time" label="Time" hint="We'll time everything around this.">
          <TimeInput
            id="time"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
          />
        </Field>

        <div className="flex flex-col gap-2.5">
          <span className="text-eyebrow">Common windows</span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2"
          >
            {QUICK.map((t, idx) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, scale: 0.88, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 + idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <Chip selected={value === t} onSelect={() => handleQuickSelect(t)}>
                  {pretty(t)}
                </Chip>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {value && !error ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display text-2xl tracking-tight text-foreground"
          >
            See you at {pretty(value)}.
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
