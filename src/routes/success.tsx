import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parse, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AnimatedButton } from "@/components/AnimatedButton";
import { HeartBurst } from "@/components/HeartBurst";
import { useDateStore } from "@/lib/store";
import { sounds } from "@/lib/sound";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useRandomMessage } from "@/hooks/useRandomMessage";
import { SpotifyEmbed } from "@/components/SpotifyEmbed";
import { MovieBackdropBackground } from "@/components/MovieBackdropBackground";
import { MoviePoster } from "@/components/MoviePoster";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/success")({
 component: SuccessPage,
});

function SuccessPage() {
 const navigate = useNavigate();
 const { date, time, movie, reset } = useDateStore();

 const handleReset = () => {
 sounds.celebrate();
 reset();
 navigate({ to: "/" });
 };

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

 const formattedDate = date ? format(parseISO(date), "EEEE, MMMM do, yyyy") : "";
 const formattedTime = time ? format(parse(time, "HH:mm", new Date()), "h:mm a") : "";

 return (
 <PageShell>
 {/* Full-page blurred backdrop from the selected movie's artwork */}
 <MovieBackdropBackground movie={movie} />

 <div className="mb-6">
 <HeartBurst active pieces={40} />
 </div>

 {/* Glassmorphism content panel for excellent text readability */}
 <motion.div
 initial={{ scale: 0.7, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: "spring", stiffness: 180, damping: 14 }}
 className="relative z-[10] w-full max-w-xl rounded-3xl border border-border/30 bg-card/60 px-6 py-8 shadow-[var(--shadow-card)] backdrop-blur-xl sm:px-8 sm:py-10"
 >
 {/* High-resolution poster (acts as the movie logo) */}
 <MoviePoster
 movie={movie}
 className="mx-auto mb-6 h-48 w-32 rounded-2xl shadow-[var(--shadow-glow)] sm:h-56 sm:w-40"
 />

 <h1 className="text-4xl font-bold text-gradient sm:text-5xlxl">
 I can't wait ❤️
 </h1>
 <p className="mt-4 text-xl text-muted-foreground">
 See you soon. Love you 🥰
 </p>

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
 <div className="mt-6 flex flex-col items-center gap-3">
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

 <div className="mt-8">
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
