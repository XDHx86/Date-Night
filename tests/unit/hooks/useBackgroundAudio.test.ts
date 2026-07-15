/**
 * Unit tests for the useBackgroundAudio hook.
 *
 * The hook is a thin adapter: it wires the store's `isAudioEnabled` flag to the
 * centralized sound engine (`setMuted` + `setBackgroundPlaylist`) and registers
 * a one-shot gesture listener that calls `unlockAudio`. The sound engine itself
 * is mocked here — its behavior is covered in sound.test.ts — so these tests
 * stay focused on the wiring.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

// Hoisted so the vi.mock factories (which run before imports) can reference them.
const mocks = vi.hoisted(() => ({
  // The mutable store the mocked `useDateStore` selector reads from.
  storeState: { isAudioEnabled: true },
  // The mocked sound engine functions.
  sound: {
    setMuted: vi.fn(),
    setBackgroundPlaylist: vi.fn(),
    unlockAudio: vi.fn(),
  },
}));

vi.mock("../../../src/lib/store", () => ({
  // The hook calls `useDateStore((s) => s.isAudioEnabled)`; resolve the selector
  // against our mutable storeState so tests can flip the flag + rerender.
  useDateStore: (selector: (s: { isAudioEnabled: boolean }) => unknown) =>
    selector(mocks.storeState),
}));

vi.mock("../../../src/lib/sound", () => ({
  setMuted: (...a: unknown[]) => mocks.sound.setMuted(...a),
  setBackgroundPlaylist: (...a: unknown[]) => mocks.sound.setBackgroundPlaylist(...a),
  unlockAudio: (...a: unknown[]) => mocks.sound.unlockAudio(...a),
}));

import { useBackgroundAudio } from "../../../src/hooks/useBackgroundAudio";

describe("useBackgroundAudio", () => {
  beforeEach(() => {
    mocks.storeState.isAudioEnabled = true;
    mocks.sound.setMuted.mockClear();
    mocks.sound.setBackgroundPlaylist.mockClear();
    mocks.sound.unlockAudio.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("return value", () => {
    it("returns { isAudioEnabled }", () => {
      const { result } = renderHook(() => useBackgroundAudio());
      expect(result.current).toHaveProperty("isAudioEnabled");
    });

    it("reflects the current store value and updates on change", () => {
      const { result, rerender } = renderHook(() => useBackgroundAudio());
      expect(result.current.isAudioEnabled).toBe(true);

      mocks.storeState.isAudioEnabled = false;
      rerender();
      expect(result.current.isAudioEnabled).toBe(false);
    });
  });

  describe("store -> sound engine sync", () => {
    it("unmutes and starts the playlist when audio is enabled", () => {
      mocks.storeState.isAudioEnabled = true;
      renderHook(() => useBackgroundAudio());

      expect(mocks.sound.setMuted).toHaveBeenCalledWith(false);
      expect(mocks.sound.setBackgroundPlaylist).toHaveBeenCalledWith(true);
    });

    it("mutes and stops the playlist when audio is disabled", () => {
      mocks.storeState.isAudioEnabled = false;
      renderHook(() => useBackgroundAudio());

      expect(mocks.sound.setMuted).toHaveBeenCalledWith(true);
      expect(mocks.sound.setBackgroundPlaylist).toHaveBeenCalledWith(false);
    });

    it("re-syncs when the store flag changes", () => {
      mocks.storeState.isAudioEnabled = true;
      const { rerender } = renderHook(() => useBackgroundAudio());

      mocks.sound.setMuted.mockClear();
      mocks.sound.setBackgroundPlaylist.mockClear();

      mocks.storeState.isAudioEnabled = false;
      rerender();
      expect(mocks.sound.setMuted).toHaveBeenCalledWith(true);
      expect(mocks.sound.setBackgroundPlaylist).toHaveBeenCalledWith(false);

      mocks.sound.setMuted.mockClear();
      mocks.sound.setBackgroundPlaylist.mockClear();

      mocks.storeState.isAudioEnabled = true;
      rerender();
      expect(mocks.sound.setMuted).toHaveBeenCalledWith(false);
      expect(mocks.sound.setBackgroundPlaylist).toHaveBeenCalledWith(true);
    });
  });

  describe("gesture unlock", () => {
    it("registers one-shot pointerdown + keydown listeners", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      renderHook(() => useBackgroundAudio());

      expect(addSpy).toHaveBeenCalledWith(
        "pointerdown",
        expect.any(Function),
        expect.objectContaining({ once: true, passive: true }),
      );
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function), {
        once: true,
      });

      addSpy.mockRestore();
    });

    it("calls unlockAudio on the first pointer gesture", () => {
      renderHook(() => useBackgroundAudio());

      window.dispatchEvent(new Event("pointerdown"));
      expect(mocks.sound.unlockAudio).toHaveBeenCalledTimes(1);

      // `{ once: true }` — a second gesture does not fire it again.
      mocks.sound.unlockAudio.mockClear();
      window.dispatchEvent(new Event("pointerdown"));
      expect(mocks.sound.unlockAudio).not.toHaveBeenCalled();
    });

    it("does not re-register gesture listeners on re-render", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const { rerender } = renderHook(() => useBackgroundAudio());

      const pointerCount = () => addSpy.mock.calls.filter((c) => c[0] === "pointerdown").length;
      expect(pointerCount()).toBe(1);

      rerender();
      rerender();
      expect(pointerCount()).toBe(1);

      addSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("removes the gesture listeners on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useBackgroundAudio());

      unmount();

      // Both gesture listeners are torn down.
      expect(removeSpy).toHaveBeenCalledWith("pointerdown", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe("robustness", () => {
    it("handles rapid isAudioEnabled toggles without throwing", () => {
      const { rerender } = renderHook(() => useBackgroundAudio());
      expect(() => {
        for (let i = 0; i < 6; i++) {
          mocks.storeState.isAudioEnabled = i % 2 === 0;
          rerender();
        }
      }).not.toThrow();
    });

    it("tolerates being mounted more than once", () => {
      expect(() => {
        renderHook(() => useBackgroundAudio());
        renderHook(() => useBackgroundAudio());
        renderHook(() => useBackgroundAudio());
      }).not.toThrow();
    });
  });
});
