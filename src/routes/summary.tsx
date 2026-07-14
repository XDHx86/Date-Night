import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parse, parseISO } from "date-fns";
import { motion, useTransform, useSpring } from "framer-motion";
import { Share2, ArrowRight, CalendarHeart, Clock, Hourglass } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Eyebrow } from "@/components/eyebrow";
import { MovieBackdropBackground } from "@/components/MovieBackdropBackground";
import { MoviePoster } from "@/components/MoviePoster";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/AnimatedButton";
import { Surface } from "@/components/ui/card";
import { HeartBurst } from "@/components/HeartBurst";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { toast } from "sonner";

export const Route = createFileRoute("/summary")({
  component: SummaryPage,
});

/**
 * Summary — the plan review (Step 5).
 *
 * One composed glass card collects everything chosen so far: the film
 * centerpiece — a poster that breathes, glows rose, and tilts toward the
 * cursor — a small pre-celebration flutter, the countdown, and the clean
 * definition list of the when/what/how-long. The movie's blurred backdrop
 * sits behind as atmosphere only; the card carries all the foreground attention.
 *
 * The "Confirm our date" CTA pulses (animate-glow) under the romance gradient,
 * teasing the payoff that waits on `/success`.
 */
function SummaryPage() {
  const navigate = useNavigate();
  const { date, time, movie } = useDateStore();
  useEffect(() => {
    if (!date || !time || !movie) {
      navigate({ to: "/date" });
    }
  }, [date, time, movie, navigate]);

  // Pointer parallax for the cinematic poster — eased through springs so it
  // glides, and frozen under reduced-motion (calm fallback).
  const { x, y, prefersReduced } = usePointerParallax();
  const rotY = useTransform(x, [-1, 1], [-8, 8]);
  const rotX = useTransform(y, [-1, 1], [8, -8]);
  const sRotY = useSpring(rotY, { stiffness: 150, damping: 20 });
  const sRotX = useSpring(rotX, { stiffness: 150, damping: 20 });
  const posterParallax = prefersReduced ? undefined : { rotateX: sRotX, rotateY: sRotY };

  // A small pre-celebration flutter once the card settles — a hint that the big
  // moment is one tap away.
  const [preBurst, setPreBurst] = useState(false);
  useEffect(() => {
    if (!movie) return;
    const t = window.setTimeout(() => setPreBurst(true), 600);
    return () => window.clearTimeout(t);
  }, [movie]);

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
    {
      icon: Hourglass,
      label: "Duration",
      value: movie?.duration ? `${movie.duration} min` : "—",
    },
  ];

  const confirm = () => {
    sounds.celebrate();
    navigate({ to: "/success" });
  };

  const romanticMessage = useRandomMessage("romantic");

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
      // fallback to clipboard if share failed
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <PageShell width="default">
      {/* Full‑page blurred backdrop behind AmbientBackdrop's tone. */}
      <MovieBackdropBackground movie={movie} />

      <Eyebrow>Step 5 — Your plan</Eyebrow>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-display text-balance text-4xl leading-[1.1] tracking-[-0.02em] sm:text-5xl"
      >
        Here&rsquo;s the plan.
      </motion.h1>

      <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
        One look before we make it official.
      </p>

      {romanticMessage ? (
        <p className="mt-4 max-w-md text-pretty text-base italic text-muted-foreground/80">
          &ldquo;{romanticMessage}&rdquo;
        </p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full"
      >
        <Surface pad="loose" glass elevate className="flex flex-col gap-7 text-left">
          {movie ? (
            <div className="relative flex flex-col items-center gap-4">
              <MoviePoster
                movie={movie}
                className="h-52 w-36 sm:h-56 sm:w-40"
                parallaxStyle={posterParallax}
              />
              {/* Pre-celebration flutter — a soft heart burst around the poster. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <HeartBurst active={preBurst} variant="soft" pieces={12} />
              </div>
              <div className="text-center">
                <h2 className="text-display text-2xl tracking-tight text-card-foreground">
                  {movie.title}
                </h2>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {movie.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {date ? (
            <div className="flex flex-col gap-2.5 border-t border-border pt-6">
              <span className="text-eyebrow">Countdown to our date</span>
              <CountdownTimer dateTimeString={`${date}T${time || "00:00"}:00`} />
            </div>
          ) : null}

          <dl className="flex w-full flex-col gap-2.5 border-t border-border pt-6">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/40 px-4 py-3"
              >
                <dt className="inline-flex items-center gap-2.5 text-muted-foreground">
                  <r.icon className="h-4 w-4" aria-hidden />
                  <span className="text-eyebrow">{r.label}</span>
                </dt>
                <dd className="text-display text-lg text-right text-foreground">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Surface>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex w-full max-w-md flex-col gap-3"
      >
        <AnimatedButton size="lg" variant="yes" onClick={confirm} className="w-full animate-glow">
          Confirm our date
          <ArrowRight className="h-4 w-4" aria-hidden />
        </AnimatedButton>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4" aria-hidden /> Share plan
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate({ to: "/movie" })}
            className="flex-1"
          >
            Change something
          </Button>
        </div>
      </motion.div>

      <div className="mt-8 w-full max-w-xl">
        <SpotifyEmbed />
      </div>
    </PageShell>
  );
}
