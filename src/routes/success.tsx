import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
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
import finalImg from "@/assets/final.jpg";

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

  return (
    <PageShell>
      {/* Animated background */}
      <AnimatedBackground className="pointer-events-none" />

      {/* Progress Indicator - show as completed */}
      <div className="mb-4">
        <ProgressIndicator currentStep={6} totalSteps={6} />
      </div>

      <HeartBurst active pieces={40} className="mb-6" />

      <motion.img
        src={finalImg}
        alt="A cute couple watching a movie under the stars"
        width={1024}
        height={1024}
        loading="eager"
        className="mb-6 h-48 w-48 rounded-3xl object-cover shadow-[var(--shadow-glow)] sm:h-60 sm:w-60"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
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
            <CountdownTimer dateString={date} />
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
    </PageShell>
  );
}