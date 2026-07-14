/**
 * Application bootstrap.
 *
 * The app is a fully client-side React SPA — there is no SSR or server
 * runtime. Vite bundles this module into the script tag that `index.html`
 * references; `createRoot` mounts the router on the client only.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router";
import { initMutedFromStorage } from "./lib/sound";
import "./styles.css";

// Restore the persisted sound preference before any UI renders, so the first
// SFX of the session already respects what the user chose last time.
initMutedFromStorage();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Could not find #root element to mount the application.");
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
