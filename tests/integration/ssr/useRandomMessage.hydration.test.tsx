/**
 * SSR / Hydration contract tests.
 *
 * These tests guard the project's invariant:
 *   "What the server renders must match what the client renders
 *    on the first paint — even when the value depends on randomness."
 *
 * They use happy-dom so React can render server-side, and assert that
 * a second render (post-mount) matches the first render's DOM shape.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { hydrateRoot, createRoot } from "react-dom/client";
import { useRandomMessage, useAnyRandomMessage } from "@/hooks/useRandomMessage";
import { messages } from "@/lib/messages";

describe("SSR — useRandomMessage is hydration-safe", () => {
  it("returns the first message of the pool during initial render", () => {
    let captured: string | null = null;
    function ReadMsg() {
      captured = useRandomMessage("encouragement");
      return React.createElement("p", null, captured);
    }
    const html = renderToString(React.createElement(ReadMsg));
    expect(captured).not.toBeNull();
    // HTML must contain the deterministic initial value.
    expect(html).toContain(captured!);
    // The captured value must equal the leading message — not a random pick.
    expect(captured).toBe(messages.encouragement[0]);
  });

  it("does not depend on Math.random during render", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    let captured: string | null = null;
    function Probe() {
      captured = useRandomMessage("encouragement");
      return null;
    }
    renderToString(React.createElement(Probe));
    expect(spy).not.toHaveBeenCalled();
    expect(captured).toBe(messages.encouragement[0]);
  });

  it("renders the same DOM on two separate SSR passes", () => {
    function Page() {
      const msg = useRandomMessage("encouragement");
      return React.createElement("p", { "data-testid": "msg" }, msg);
    }
    const a = renderToString(React.createElement(Page));
    const b = renderToString(React.createElement(Page));
    expect(a).toBe(b);
  });
});

describe("SSR — useAnyRandomMessage is hydration-safe", () => {
  it("returns the empty string during initial render", () => {
    let captured: string | null = null;
    function Probe() {
      captured = useAnyRandomMessage();
      return null;
    }
    renderToString(React.createElement(Probe));
    expect(captured).toBe("");
  });

  it("renders identically across passes (deterministic SSR)", () => {
    function Page() {
      const msg = useAnyRandomMessage();
      return React.createElement("p", null, msg);
    }
    const a = renderToString(React.createElement(Page));
    const b = renderToString(React.createElement(Page));
    expect(a).toBe(b);
  });
});

describe("Hydration — server output matches client first paint", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates a server-rendered tree without a mismatch warning", () => {
    function Page() {
      const msg = useRandomMessage("encouragement");
      return React.createElement("div", { "data-testid": "hydration-target" }, msg);
    }

    const ssrHtml = renderToString(React.createElement(Page));

    const wrapper = document.createElement("div");
    wrapper.id = "root";
    wrapper.innerHTML = ssrHtml;
    document.body.appendChild(wrapper);
    const target = document.body.querySelector("#root") as HTMLElement;

    // Capture React's hydration warning.
    const errors: unknown[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => errors.push(args);

    try {
      hydrateRoot(target, React.createElement(Page));
    } finally {
      console.error = origError;
    }

    const hydrationMismatches = errors.filter((args) =>
      JSON.stringify(args).toLowerCase().includes("hydrat"),
    );
    expect(hydrationMismatches).toEqual([]);
  });

  it("client-takes-over for ssr-only output", () => {
    function Page() {
      const msg = useRandomMessage("encouragement");
      return React.createElement("div", { "data-testid": "ctt" }, msg);
    }

    const ssrHtml = renderToString(React.createElement(Page));
    const container = document.createElement("div");
    container.innerHTML = ssrHtml;

    const root = createRoot(container);
    root.render(React.createElement(Page));
    expect(container.textContent).toBe(messages.encouragement[0]);
  });

  it("static markup never contains random picks", () => {
    function Page() {
      const a = useRandomMessage("encouragement");
      const b = useAnyRandomMessage();
      return React.createElement(
        "div",
        null,
        React.createElement("span", { "data-a": "a" }, a),
        React.createElement("span", { "data-b": "b" }, b),
      );
    }

    const html = renderToStaticMarkup(React.createElement(Page));
    expect(html).toContain(messages.encouragement[0]);
  });
});

describe("Hydration — known good messages are non-empty", () => {
  it("every encouragement message has non-empty content", () => {
    expect(messages.encouragement.length).toBeGreaterThan(0);
    for (const msg of messages.encouragement) {
      expect(msg.trim()).not.toBe("");
    }
  });
});
