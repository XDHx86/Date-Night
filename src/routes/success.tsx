import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parse, parseISO } from "date-fns";
import { Moon, Sparkles, Heart, Film, Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const { date, time, movie, reset, step, setStep } = useDateStore();

  // Set current step (success is step 7? We have 6 steps, but we'll show as completed)
  useEffect(() => {
    setStep(6); // Show as completed
  }, [setStep]);

  const handleReset = () => {
    sounds.celebrate();
    reset();
    navigate({ to: "/" });
  };

  const formattedDate = date ? format(parseISO(date), "EEEE, MMMM do, yyyy") : "";
  const formattedTime = time ? format(parse(time, "HH:mm", new Date()), "h:mm a") : "";

  // Get a celebratory message
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
    } catch (err) {
      // fallback to clipboard if share failed
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard! (fallback)");
    }
  };

  return (
    <PageShell>
      {/* Movie background with dark overlay */}
      {movie && movie.poster_path ? (
        <div className="fixed inset-0 z-[-5]">
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/original${movie.poster_path}`}
              alt={`${movie.title} backdrop`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to existing animated background if image fails to load
                // We don't need to do anything here as the AnimatedBackground component provides a fallback
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>
      ) : (
        <div className="fixed inset-0 z-[-5]">
          {/* Fallback to existing background if no poster */}
          <AnimatedBackground className="pointer-events-none" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      {/* Progress Indicator - show as completed */}
      <div className="mb-4">
        <ProgressIndicator currentStep={6} totalSteps={6} />
      </div>

      <div className="mb-6">
        <HeartBurst active pieces={40} />
      </div>

      <motion.div
        className="relative z-[10]"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      >
        <div className="mb-6">
          <HeartBurst active pieces={40} />
        </div>

        <motion.img
          src={movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/assets/final.jpg"}
          alt={movie ? `${movie.title} poster` : "A cute couple watching a movie under the stars"}
          width={1024}
          height={1024}
          loading="eager"
          className="mb-6 h-48 w-48 rounded-3xl object-cover shadow-[var(--shadow-glow)] sm:h-60 sm:w-60"
        />

        <h1 className="text-5xl font-bold text-gradient sm:text-6xl">I can't wait ❤️</h1>
        <p className="mt-4 text-xl text-muted-foreground">See you soon. Love you 🥰</p>

        {/* Celebration message */}
        {celebrationMessage && (
          <p className="mt-4 text-center text-muted-foreground italic max-w-xl">
            "{celebrationMessage}"
          </p>
        )}

        {date && time && movie && (
          <div className="mt-8 space-y-4 text-center">
            <div className="mb-2">
              <p className="text-lg font-medium text-muted-foreground">
                Countdown to our date
              </p>
              {/* Combine date and time for accurate countdown */}
              <CountdownTimer dateTimeString={`${date}T${time}:00`} />
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                On {formattedDate} at {formattedTime}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                Watching {movie.title} 🍿
              </p>
            </div>
          </div>
        )}

        {/* Love Letter link */}
        <div className="mt-6 text-center">
          <AnimatedButton variant="no" size="md" onClick={handleShare}>
            Share our date plan 📤
          </AnimatedButton>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/love-letter" })}
          >
            View our love letter 💌
          </AnimatedButton>
        </div>

        {/* Spotify Embed (if configured) */}
        <SpotifyEmbed />

        <div className="mt-8 flex flex-col gap-3">
          <AnimatedButton
            variant="gold"
            size="md"
            onClick={handleReset}
          >
            Plan another date <ArrowRight className="h-4 w-4" />
          </AnimatedButton>
        </div>
      </motion.div>
    </PageShell>
  );
}