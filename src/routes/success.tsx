import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, parse, parseISO } from "date-fns";
import { ArrowRight, Share2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { MovieBackdropBackground } from "@/components/MovieBackdropBackground";
import { MoviePoster } from "@/components/MoviePoster";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/card";
import { HeartBurst } from "@/components/HeartBurst";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { isLoveLetterFeatureEnabled } from "@/lib/loveLetterConfig";
import { toast } from "sonner";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

/**
 * Success — the cinematic payoff (Step 6).
 *
 * The "level-complete / loot-chest reveal": on mount a celebratory chord fires,
 * a confetti avalanche + heart-rain pour down, a single light band sweeps the
 * award card, and a rose bloom blooms over the film backdrop. The poster is
 * framed as an award card (glass + rose-glow + breathe) crowned by a
 * gradient-romance ribbon, with the countdown as the "stage time". This screen
 * owns its own restart (the progress bar hides here), so "Plan another date" is
 * the prominent primary with share + love-letter beside it as quieter equals.
 */
function SuccessPage() {
  const navigate = useNavigate();
  const { date, time, movie, reset } = useDateStore();
  const loveLetterEnabled = isLoveLetterFeatureEnabled();

  // One celebratory activation on mount — confetti avalanche + heart-rain,
  // then the overlays settle and leave.
  const [celebrate, setCelebrate] = useState(true);
  useEffect(() => {
    sounds.celebrate();
    const t = window.setTimeout(() => setCelebrate(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  const handleReset = () => {
    sounds.celebrate();
    reset();
    navigate({ to: "/" });
  };

  const celebrationMessage = useRandomMessage("celebration");

  const handleShare = async () => {
    const { date, time, movie, loveMessage, isDarkMode } = useDateStore.getState();
    const url = new URL(window.location.origin + window.location.pathname);
    if (date) url.searchParams.set("date", date);
    if (time) url.searchParams.set("time", time);
    if (movie) url.searchParams.set("movie", movie.id.toString());
    if (loveMessage) url.searchParams.set("love", loveMessage);
    if (isDarkMode) url.searchParams.set("theme", "dark");

    const shareUrl = url.toString();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Our Date Night",
          text: "Check out our date plan!",
          url: shareUrl,
        });
        toast.success("Link shared!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const formattedDate = date ? format(parseISO(date), "EEEE, MMMM do, yyyy") : "";
  const formattedTime = time ? format(parse(time, "HH:mm", new Date()), "h:mm a") : "";

  return (
    <PageShell width="default">
      {/* Atmosphere only — blurred film wash behind the content. */}
      <MovieBackdropBackground movie={movie} dim="soft" />

      {/* Intensifying bloom — a rose spotlight that blooms over the backdrop. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          background:
            "radial-gradient(52% 42% at 50% 36%, oklch(from var(--primary) l c h / 0.3), transparent 70%)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.85, 0.5], scale: [0.8, 1.1, 1] }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* The show-stopper — a confetti avalanche and a heart-rain. */}
      <ConfettiCelebration active={celebrate} variant="avalanche" />
      <HeartBurst active={celebrate} variant="heartRain" pieces={60} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 w-full max-w-xl rounded-3xl px-6 py-8 text-center shadow-[var(--shadow-md)] glass-strong sm:px-8 sm:py-10"
      >
        <Eyebrow>Done</Eyebrow>

        <h1 className="text-display text-balance text-5xl tracking-[-0.03em] sm:text-6xl">
          It&rsquo;s a date.
        </h1>

        {date && time ? (
          <p className="mx-auto mt-5 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
            See you {formattedDate} at {formattedTime}. Can&rsquo;t wait.
          </p>
        ) : (
          <p className="mx-auto mt-5 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
            See you soon.
          </p>
        )}

        {celebrationMessage ? (
          <p className="mx-auto mt-4 max-w-md text-pretty text-base italic text-muted-foreground/80">
            &ldquo;{celebrationMessage}&rdquo;
          </p>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full"
      >
        <Surface
          pad="loose"
          glass
          elevate
          className="relative flex flex-col items-center gap-6 overflow-hidden text-center"
        >
          {/* One-shot shimmer band — a light sweep across the award card. */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0">
            <motion.div
              className="absolute inset-y-0 -left-1/3 w-1/2 -skew-x-12"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.32), transparent)",
              }}
              initial={{ x: "-160%" }}
              animate={{ x: "480%" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            />
          </motion.div>

          {/* Ribbon — the gradient-romance banner crowning the award. */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.2 }}
            className="z-10 rounded-b-xl bg-[image:var(--gradient-romance)] px-6 py-1.5 text-play text-sm tracking-wide text-primary-foreground shadow-[var(--shadow-sm)]"
          >
            ★ Tonight&rsquo;s Feature ★
          </motion.div>

          {movie ? (
            <div className="flex flex-col items-center gap-3">
              <MoviePoster movie={movie} className="h-52 w-36 sm:h-56 sm:w-40" />
              <span className="text-3xl" aria-hidden>
                🏆
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-eyebrow">Watching</span>
                <h2 className="text-display text-2xl tracking-tight text-card-foreground">
                  {movie.title}
                </h2>
              </div>
            </div>
          ) : null}

          {date && time && movie ? (
            <div className="flex w-full flex-col gap-2.5 border-t border-border pt-6 text-left">
              <span className="text-eyebrow">Stage time</span>
              <CountdownTimer dateTimeString={`${date}T${time}:00`} />
            </div>
          ) : null}
        </Surface>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex w-full max-w-md flex-col gap-3"
      >
        <Button size="lg" variant="primary" onClick={handleReset}>
          Plan another date
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4" aria-hidden /> Share plan
          </Button>
          {loveLetterEnabled ? (
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate({ to: "/love-letter" })}
              className="flex-1"
            >
              <Mail className="h-4 w-4" aria-hidden /> Love letter
            </Button>
          ) : null}
        </div>
      </motion.div>

      <div className="mt-8 w-full max-w-xl">
        <SpotifyEmbed />
      </div>
    </PageShell>
  );
}
