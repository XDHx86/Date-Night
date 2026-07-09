import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parse, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { CalendarHeart, Clock, Film, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";

export const Route = createFileRoute("/summary")({
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();
  const { date, time, movie, step, setStep } = useDateStore();

  // Set current step (summary is step 6? Actually, we have 6 steps, and summary is after movie, so we'll show as completed)
  useEffect(() => {
    setStep(6); // Show as completed since we're after movie selection
  }, [setStep]);

  if ((!date || !time || !movie) && typeof window !== "undefined") {
    navigate({ to: "/date" });
  }

  const rows = [
    {
      icon: CalendarHeart,
      label: "Date",
      value: date ? format(parseISO(date), "EEEE, MMMM do") : "—",
    },
    {
      icon: Clock,
      label: "Time",
      value: time ? format(parse(time, "HH:mm", new Date()), "h:mm a") : "—",
    },
    { icon: Film, label: "Movie", value: movie?.title ?? "—" },
  ];

  const confirm = () => {
    sounds.celebrate();
    navigate({ to: "/success" });
  };

  // Get a romantic message for this screen
  const romanticMessage = useRandomMessage("romantic");

  return (
    <PageShell>
      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      {/* Progress Indicator - show as completed */}
      <div className="mb-4">
        <ProgressIndicator currentStep={6} totalSteps={6} />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-9"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-6 w-6 fill-primary text-primary" />
          <h1 className="text-3xl font-bold text-gradient">Our Date</h1>
          <Heart className="h-6 w-6 fill-primary text-primary" />
        </div>

        {/* Romantic message */}
        {romanticMessage && (
          <p className="mb-4 text-center text-muted-foreground italic">
            "{romanticMessage}"
          </p>
        )}

        {/* Countdown timer */}
        {date && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-medium text-muted-foreground">
              Countdown to our date
            </p>
            <CountdownTimer dateString={date} />
          </div>
        )}

        {movie && (
          <div
            className="mx-auto mt-6 flex h-28 w-28 items-center justify-center rounded-2xl text-5xl shadow-[var(--shadow-soft)]"
            style={{ backgroundImage: movie.posterGradient }}
            aria-hidden
          >
            {movie.emoji}
          </div>
        )}

        <div className="mt-6 space-y-3 text-left">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-4 rounded-2xl bg-secondary/60 px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
                <r.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {r.label}
                </p>
                <p className="text-lg font-bold text-card-foreground">{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        {movie && (
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-xl font-bold text-primary">Let's gooooo 🥹</p>

        <div className="mt-6 flex flex-col gap-3">
          <AnimatedButton variant="yes" size="md" onClick={confirm}>
            Confirm our date ❤️
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="sm" onClick={() => navigate({ to: "/movie" })}>
            Change something
          </AnimatedButton>
        </div>

        {/* Spotify Embed (if configured) */}
        <SpotifyEmbed />
      </motion.div>
    </PageShell>
  );
}