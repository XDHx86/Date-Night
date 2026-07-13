import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HeartExplosion } from "@/components/HeartExplosion";
import { BottomControlBar } from "@/components/BottomControlBar";
import { BackgroundProvider } from "@/components/BackgroundContext";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { BackgroundVariantSync } from "@/components/BackgroundVariantSync";
import { FloatingDecorations } from "@/components/FloatingDecorations";
import { TopProgressBar } from "@/components/TopProgressBar";
import { Toaster } from "@/components/ui/sonner";
import { useDateStore } from "@/lib/store";
import { useShakeEffect } from "@/hooks/useShakeEffect";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import { reportLovableError } from "@/lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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

  // Listen for device shakes — fires the heart explosion.
  // 3 s cooldown prevents accidental double‑triggering.
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

  // Background audio — autoplay, unlock‑after‑first‑interaction fallback,
  // and stays synchronised with the store‑driven UI toggle.
  useBackgroundAudio();

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundProvider>
        <BackgroundVariantSync />
        <BackgroundLayer />

        {/* Persistent, route‑aware progress bar */}
        <TopProgressBar />

        {/* Heart explosion Easter egg */}
        <HeartExplosion active={burst} />

        <Outlet />

        {/* Persistent decorations and bottom control bar */}
        <FloatingDecorations />
        <BottomControlBar />

        <Toaster />
      </BackgroundProvider>
    </QueryClientProvider>
  );
}
