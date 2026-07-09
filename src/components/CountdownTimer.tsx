import { useEffect, useState } from "react";

/**
 * Countdown timer that shows time until a given date
 */
export function CountdownTimer({
  dateString, // Expected format: YYYY-MM-DD (ISO date string)
}: {
  dateString: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const targetDate = new Date(dateString);
    // Set target to start of the day (00:00:00) of the selected date
    targetDate.setHours(0, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const remainingSeconds = seconds % 60;
      const remainingMinutes = minutes % 60;
      const remainingHours = hours % 24;

      setTimeLeft({
        days,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds,
      });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [dateString]);

  if (!timeLeft) {
    return <div className="text-center text-muted-foreground">Calculating...</div>;
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="text-center space-x-2 text-sm font-mono">
      <div>
        <div className="text-lg font-bold">{days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="flex h-6 items-center gap-1 mx-1">
        <div className="w-1 bg-muted rounded h-full" />
        <div>
          <div className="text-lg font-bold">{hours.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
        <div className="w-1 bg-muted rounded h-full" />
        <div>
          <div className="text-lg font-bold">{minutes.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </div>
        <div className="w-1 bg-muted rounded h-full" />
        <div>
          <div className="text-lg font-bold">{seconds.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Seconds</div>
        </div>
      </div>
    </div>
  );
}