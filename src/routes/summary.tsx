import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parse, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { CalendarHeart, Clock, Film, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { MovieBackdropBackground } from "@/components/MovieBackdropBackground";
import { MoviePoster } from "@/components/MoviePoster";
import { AnimatedButton } from "@/components/AnimatedButton";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { toast } from "sonner";

export const Route = createFileRoute("/summary")({
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();
 const { date, time, movie } = useDateStore();
  useEffect(() => {
    if (!date || !time || !movie) {
      navigate({ to: "/date" });
    }
  }, [date, time, movie, navigate]);

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
    { icon: Clock, label: "Duration", value: movie?.duration ? `${movie.duration} min` : "—" },
  ];

  const confirm = () => {
    sounds.celebrate();
    navigate({ to: "/success" });
  };

  // Get a romantic message for this screen
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
        toast.success("Link copied to clipboard! resetting...");
      }
    } catch (err) {
      // fallback to clipboard if share failed
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard! (fallback)");
    }
  };

  return (
    <PageShell>
      {/* Full‑page blurred backdrop from the selected movie's artwork */}
      <MovieBackdropBackground movie={movie} />


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
           </h2>
            <CountdownTimer dateTimeString={`${date}T${time || '00:00'}:00`} />
         </div>
        )}

        {movie && (
          <div className="mt-6 flex justify-center">
            <MoviePoster
              movie={movie}
              className="h-48 w-32 sm:h-56 sm:w-40"
            />
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
            {movie.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                {tag}
             </span>
            ))}
         </div>
        )}

        <p className="mt-6 text-xl font-bold text-primary">Let's gooooo 🥹</p>

        <div className="mt-6 flex flex-col gap-3">
          <AnimatedButton variant="no" size="md" onClick={handleShare}>
            Share our date plan 📤
         </AnimatedButton>
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
