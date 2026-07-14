import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True when the target time is at or in the past. */
  done: boolean;
}

function diff(now: number, target: number): TimeLeft {
  const delta = target - now;
  if (delta <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const totalSeconds = Math.floor(delta / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, done: false };
}

interface Props {
  /** ISO date-time string with timezone offset (parsed by `Date`). */
  dateTimeString: string;
}

/**
 * Countdown to a date — four columns of large numerals separated by
 * quiet vertical rules. Reads as a single composed unit; digits
 * tabular so they don't shimmer.
 */
export function CountdownTimer({ dateTimeString }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(dateTimeString).getTime();
    if (Number.isNaN(target)) {
      setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
      return;
    }

    const tick = () => setTime(diff(Date.now(), target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateTimeString]);

  if (!time) {
    return <p className="text-sm text-muted-foreground">Calculating…</p>;
  }

  if (time.done) {
    return <p className="text-display text-2xl text-foreground">It's tonight</p>;
  }

  const units: Array<{ label: string; value: number }> = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div
      className="grid w-full grid-cols-4 gap-2 sm:gap-4"
      aria-live="polite"
      aria-label={`Time remaining: ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
    >
      {units.map((u, idx) => (
        <div key={u.label} className="flex items-stretch gap-2">
          <div className="flex flex-1 flex-col items-center rounded-md border border-border bg-card px-2 py-3 text-card-foreground shadow-[var(--shadow-sm)]">
            <span className="text-display text-3xl font-medium leading-none tracking-tight tabular-nums sm:text-4xl">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-eyebrow mt-2">{u.label}</span>
          </div>
          {idx < units.length - 1 ? (
            <span aria-hidden className="self-stretch w-px bg-border" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
