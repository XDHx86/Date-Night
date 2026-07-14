import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Builds the singleton TanStack Router instance.
 *
 * The query client is created here, attached to the router's `context`,
 * and read by `__root.tsx` via `Route.useRouteContext()`. Tests that need
 * to spin up a fresh router should call {@link getRouter} again, which
 * creates a new client + router pair per call.
 */
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "");
export function getRouter() {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath,
  });
}

/**
 * The production router instance. Used by `src/main.tsx` to mount the
 * SPA shell via `<RouterProvider router={router} />`.
 */
export const router = getRouter();
