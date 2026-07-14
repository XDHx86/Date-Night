import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HeartExplosion } from "@/components/HeartExplosion";
import { BottomControlBar } from "@/components/BottomControlBar";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { TopProgressBar } from "@/components/TopProgressBar";
import { Toaster } from "@/components/ui/sonner";
import { useDateStore } from "@/lib/store";
import { useShakeEffect } from "@/hooks/useShakeEffect";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { reportLovableError } from "@/lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="text-eyebrow mb-3">Error 404</p>
        <h1 className="text-display text-5xl tracking-[-0.02em]">Not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="text-eyebrow mb-3">Something went sideways</p>
        <h1 className="text-display text-4xl tracking-[-0.02em]">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You can try refreshing or head back home to start over.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[0.95rem] font-medium text-primary-foreground shadow-[var(--shadow-sm)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-transparent px-5 text-[0.95rem] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [burst, setBurst] = useState(false);
  const lastShakeRef = useRef(0);
  const { isDarkMode } = useDateStore();

  // Shake-to-burst easter egg. 3 s debounce — accidental shakes
  // shouldn't double-trigger.
  useShakeEffect(
    () => {
      const now = Date.now();
      if (now - lastShakeRef.current > 3000) {
        lastShakeRef.current = now;
        setBurst(true);
        window.setTimeout(() => setBurst(false), 1500);
      }
    },
    { threshold: 25 },
  );

  // Sync dark mode with the document root – keeps CSS variables in sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Background audio — autoplay, unlock-after-first-interaction fallback,
  // and stays synchronised with the store-driven UI toggle.
  useBackgroundAudio();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Static backdrop. No animation, no random particles. */}
      <AmbientBackdrop />

      {/* Persistent, layout-level progress indicator. Renders nothing
          on /success so the celebration page stays uncluttered. */}
      <TopProgressBar />

      {/* Shake-triggered easter egg. Renders nothing while idle. */}
      <HeartExplosion active={burst} />

      <Outlet />

      {/* Slim, bottom-pinned control bar. */}
      <BottomControlBar />

      <Toaster />
    </QueryClientProvider>
  );
}
