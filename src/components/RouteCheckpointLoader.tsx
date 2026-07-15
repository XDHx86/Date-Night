import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/**
 * Loading state shown by `/summary` and `/success` while the shareable-link
 * checkpoint fetches the selected movie from TMDB. Keeps the page shell warm so
 * the restored plan pops in without a layout shift, and is purely decorative
 * (aria-hidden) since the surrounding route is not interactive yet.
 */
export function RouteCheckpointLoader() {
  return (
    <PageShell width="default" aria-busy="true">
      <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl glass px-6 py-16 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        <span className="animate-fade-in text-play text-base text-foreground">
          Pulling up your date plan…
        </span>
      </div>
    </PageShell>
  );
}
