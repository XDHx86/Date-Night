import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { toast } from "sonner";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

/**
 * Success — the closing moment (Step 6).
 *
 * The movie's backdrop stays behind as atmosphere; a single card
 * collects the poster, the countdown, and the when/what. This screen
 * owns its own restart (the progress bar hides here), so "Plan another
 * date" is the prominent primary and the share/letter actions sit
 * beside it as quieter equals.
 */
function SuccessPage() {
  const navigate = useNavigate();
  const { date, time, movie, reset } = useDateStore();

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
      <MovieBackdropBackground movie={movie} />

      {/* One composed celebratory burst, then it leaves. */}
      <div className="mb-2 flex justify-center">
        <HeartBurst active pieces={18} />
      </div>

      <Eyebrow>Done</Eyebrow>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-display text-balance text-5xl tracking-[-0.03em] sm:text-6xl"
      >
        It&rsquo;s a date.
      </motion.h1>

      {date && time ? (
        <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
          See you {formattedDate} at {formattedTime}. Can&rsquo;t wait.
        </p>
      ) : (
        <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
          See you soon.
        </p>
      )}

      {celebrationMessage ? (
        <p className="mt-4 max-w-md text-pretty text-base italic text-muted-foreground/80">
          &ldquo;{celebrationMessage}&rdquo;
        </p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 w-full"
      >
        <Surface pad="loose" elevate className="flex flex-col items-center gap-6 text-center">
          {movie ? <MoviePoster movie={movie} className="h-52 w-36 sm:h-56 sm:w-40" /> : null}

          {movie ? (
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow">Watching</span>
              <h2 className="text-display text-2xl tracking-tight text-card-foreground">
                {movie.title}
              </h2>
            </div>
          ) : null}

          {date && time && movie ? (
            <div className="flex w-full flex-col gap-2.5 border-t border-border pt-6 text-left">
              <span className="text-eyebrow">Countdown to our date</span>
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
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate({ to: "/love-letter" })}
            className="flex-1"
          >
            <Mail className="h-4 w-4" aria-hidden /> Love letter
          </Button>
        </div>
      </motion.div>

      <div className="mt-8 w-full max-w-xl">
        <SpotifyEmbed />
      </div>
    </PageShell>
  );
}
