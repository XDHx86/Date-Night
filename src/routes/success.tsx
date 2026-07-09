import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { format, parse, parseISO } from "date-fns";
import finalImg from "@/assets/final.jpg";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const navigate = useNavigate();
  const { date, time, movie, reset } = useDateStore();

  useEffect(() => {
    sounds.celebrate();
  }, []);

  const when =
    date && time
      ? `${format(parseISO(date), "EEEE, MMM do")} at ${format(
          parse(time, "HH:mm", new Date()),
          "h:mm a",
        )}`
      : null;

  return (
    <PageShell particles={30}>
      <HeartBurst active pieces={40} />

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

      {when && movie && (
        <div className="mt-6 rounded-2xl border border-border bg-card/80 px-6 py-4 shadow-[var(--shadow-soft)] backdrop-blur">
          <p className="font-bold text-card-foreground">{when}</p>
          <p className="text-primary">watching {movie.title} 🍿</p>
        </div>
      )}

      <AnimatedButton
        variant="ghost"
        size="sm"
        className="mt-8"
        onClick={() => {
          reset();
          navigate({ to: "/" });
        }}
      >
        Start over 💌
      </AnimatedButton>
    </PageShell>
  );
}
