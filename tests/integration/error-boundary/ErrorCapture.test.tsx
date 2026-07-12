/**
 * Error reporting integration tests.
 *
 * Datenight captures unhandled errors out-of-band so server.ts can recover
 * the original stack. These tests pin `consumeLastCapturedError` and the
 * global listener behaviour so a refactor cannot silently drop the stack.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consumeLastCapturedError } from "@/lib/error-capture";

describe("Error capture — consumeLastCapturedError", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined initially", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures a thrown error via the global 'error' event", () => {
    const handler = vi.fn();
    globalThis.addEventListener("error", handler);
    try {
      // Dispatch an error event — the module's listener should record it.
      const errEvt = new ErrorEvent("error", {
        error: new Error("captured-globally"),
        message: "captured-globally",
      });
      globalThis.dispatchEvent(errEvt);

      const captured = consumeLastCapturedError();
      expect(captured).toBeDefined();
      expect(String(captured)).toContain("captured-globally");
    } finally {
      globalThis.removeEventListener("error", handler);
    }
  });

  it("captures unhandled promise rejections", () => {
    // Build a real Event — jsdom doesn't accept plain objects on dispatchEvent.
    const evt = new Event("unhandledrejection");
    Object.assign(evt, { reason: new Error("rejected-globally") });
    globalThis.dispatchEvent(evt);
    const captured = consumeLastCapturedError();
    expect(captured).toBeDefined();
    expect(String(captured)).toContain("rejected-globally");
  });

  it("expires records older than TTL", () => {
    globalThis.dispatchEvent(
      new ErrorEvent("error", {
        error: new Error("doomed"),
        message: "doomed",
      }),
    );

    // Move the clock forward past the TTL.
    vi.advanceTimersByTime(6_000);

    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("returns each captured error only once (single-shot)", () => {
    globalThis.dispatchEvent(
      new ErrorEvent("error", {
        error: new Error("one-shot"),
        message: "one-shot",
      }),
    );

    expect(String(consumeLastCapturedError())).toContain("one-shot");
    expect(consumeLastCapturedError()).toBeUndefined();
  });
});
