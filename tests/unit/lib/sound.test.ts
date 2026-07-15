/**
 * Unit tests for src/lib/sound.ts — the SFX synth + the background playlist
 * engine. jsdom gives us a real window/document/localStorage but no
 * AudioContext and no real media playback, so we stub those minimally.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// --- jsdom has no AudioContext; provide a minimal one for SFX synthesis. ------
class MockOscillator {
  type = "sine" as OscillatorType;
  frequency = { setValueAtTime: vi.fn() };
  detune = { value: 0 };
  start = vi.fn();
  stop = vi.fn();
  // `osc.connect(g).connect(destination)` is chained, so connect returns a
  // connectable.
  connect = vi.fn(() => ({ connect: vi.fn() }));
}
class MockGain {
  gain = { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn(() => ({ connect: vi.fn() }));
}
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => new MockOscillator());
  createGain = vi.fn(() => new MockGain());
  resume = vi.fn(() => Promise.resolve());
}

// --- A controllable <audio> stand-in for the playlist player. ----------------
interface FakeAudio {
  preload: string;
  loop: boolean;
  volume: number;
  src: string;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  __emit: (type: string) => void;
}
function makeFakeAudio(): FakeAudio {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    preload: "auto",
    loop: false,
    volume: 1,
    src: "",
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: vi.fn((type: string, cb: () => void) => {
      (listeners[type] ??= []).push(cb);
    }),
    removeEventListener: vi.fn(),
    __emit: (type: string) => {
      (listeners[type] ?? []).forEach((cb) => cb());
    },
  };
}

/** Flush the microtask queue so promise handlers (.then/.catch) have run. */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

import {
  isMuted,
  setMuted,
  initMutedFromStorage,
  sounds,
  pickBackgroundTrack,
  createBackgroundPlaylist,
  setBackgroundPlaylist,
  unlockAudio,
  resetBackgroundAudio,
} from "../../../src/lib/sound";

describe("sound.ts", () => {
  beforeEach(() => {
    vi.stubGlobal("AudioContext", MockAudioContext);
    localStorage.clear();
    // Sync the module playlist singleton back to a pristine state so the
    // singleton-driven tests (setBackgroundPlaylist / unlockAudio) don't leak
    // a cached <audio> element between tests.
    resetBackgroundAudio();
    setMuted(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /* ----------------------------- mute + SFX ------------------------------ */
  describe("setMuted / isMuted / initMutedFromStorage", () => {
    it("toggles and persists to localStorage", () => {
      setMuted(false);
      expect(isMuted()).toBe(false);
      expect(localStorage.getItem("sound-muted")).toBe("0");

      setMuted(true);
      expect(isMuted()).toBe(true);
      expect(localStorage.getItem("sound-muted")).toBe("1");
    });

    it("initMutedFromStorage reads '0' as unmuted", () => {
      localStorage.setItem("sound-muted", "0");
      initMutedFromStorage();
      expect(isMuted()).toBe(false);
    });

    it("initMutedFromStorage defaults to muted when unset", () => {
      initMutedFromStorage();
      expect(isMuted()).toBe(true);
    });

    it("initMutedFromStorage tolerates a corrupted value", () => {
      localStorage.setItem("sound-muted", "garbage");
      expect(() => initMutedFromStorage()).not.toThrow();
      expect(isMuted()).toBe(true);
    });
  });

  describe("sounds (SFX)", () => {
    it("exposes the documented blips", () => {
      expect(typeof sounds.click).toBe("function");
      expect(typeof sounds.pop).toBe("function");
      expect(typeof sounds.celebrate).toBe("function");
      expect(typeof sounds.whoosh).toBe("function");
      expect(typeof sounds.twinkle).toBe("function");
      expect(typeof sounds.sparkle).toBe("function");
    });

    it("does not throw while muted", () => {
      setMuted(true);
      expect(() => {
        sounds.click();
        sounds.pop();
        sounds.celebrate();
        sounds.whoosh();
        sounds.twinkle();
        sounds.sparkle();
      }).not.toThrow();
    });

    it("does not throw paths through the live graph when unmuted", () => {
      setMuted(false);
      expect(() => {
        sounds.click();
        sounds.pop();
        sounds.celebrate();
      }).not.toThrow();
    });
  });

  /* -------------------------- track selection --------------------------- */
  describe("pickBackgroundTrack", () => {
    it("returns -1 when there are no tracks", () => {
      expect(pickBackgroundTrack(-1, 0)).toBe(-1);
      expect(pickBackgroundTrack(3, 0)).toBe(-1);
    });

    it("always returns 0 for a single track", () => {
      expect(pickBackgroundTrack(-1, 1)).toBe(0);
      expect(pickBackgroundTrack(0, 1)).toBe(0);
    });

    it("returns an in-range index for the first pick", () => {
      for (let i = 0; i < 50; i++) {
        const idx = pickBackgroundTrack(-1, 5);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(5);
      }
    });

    it("nudges off the current track when the random draw repeats it", () => {
      // floor(0.6 * 5) = 3
      const rand = vi.fn(() => 0.6);
      expect(pickBackgroundTrack(3, 5, rand)).toBe(4); // 3 -> nudged to 4
    });

    it("keeps a draw that isn't the current track", () => {
      const rand = vi.fn(() => 0.6);
      expect(pickBackgroundTrack(1, 5, rand)).toBe(3); // 3 != 1, kept
    });

    it("wraps the nudge at the upper boundary", () => {
      // floor(0.99 * 5) = 4
      const rand = vi.fn(() => 0.99);
      expect(pickBackgroundTrack(4, 5, rand)).toBe(0); // 4 -> (4+1) % 5 = 0
    });

    it("never immediately repeats the current track when >1 exist", () => {
      for (let i = 0; i < 1000; i++) {
        const cur = i % 5;
        expect(pickBackgroundTrack(cur, 5)).not.toBe(cur);
      }
    });
  });

  /* --------------------------- playlist core ---------------------------- */
  describe("createBackgroundPlaylist", () => {
    it("reports its track count", () => {
      expect(createBackgroundPlaylist([]).trackCount).toBe(0);
      expect(createBackgroundPlaylist(["a.mp3", "b.mp3"]).trackCount).toBe(2);
    });

    it("loads a random track and plays on enable", () => {
      const tracks = ["/a.mp3", "/b.mp3", "/c.mp3"];
      const fake = makeFakeAudio();
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      createBackgroundPlaylist(tracks).setEnabled(true);

      expect(fake.play).toHaveBeenCalledTimes(1);
      expect(tracks).toContain(fake.src);
    });

    it("advances to a different track when the current one ends", () => {
      const tracks = ["/a.mp3", "/b.mp3", "/c.mp3"];
      const fake = makeFakeAudio();
      // Sequence: first pick -> index 0; on end -> index 1 (≠ 0).
      const rolls = [0.0, 0.5];
      let i = 0;
      const rand = vi.spyOn(Math, "random").mockImplementation(() => rolls[i++] ?? 0.5);
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      const list = createBackgroundPlaylist(tracks);
      list.setEnabled(true);
      expect(fake.src).toBe("/a.mp3");

      fake.__emit("ended");
      expect(fake.src).toBe("/b.mp3");
      expect(fake.play).toHaveBeenCalledTimes(2);

      rand.mockRestore();
    });

    it("pauses on disable without reloading", () => {
      const tracks = ["/a.mp3", "/b.mp3"];
      const fake = makeFakeAudio();
      const rand = vi.spyOn(Math, "random").mockReturnValue(0.0); // index 0
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      const list = createBackgroundPlaylist(tracks);
      list.setEnabled(true);
      list.setEnabled(false);

      expect(fake.pause).toHaveBeenCalledTimes(1);
      expect(fake.src).toBe("/a.mp3"); // untouched

      rand.mockRestore();
    });

    it("resumes the current track in place on re-enable", () => {
      const tracks = ["/a.mp3", "/b.mp3", "/c.mp3"];
      const fake = makeFakeAudio();
      const rand = vi.spyOn(Math, "random").mockReturnValue(0.0); // index 0
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      const list = createBackgroundPlaylist(tracks);
      list.setEnabled(true);
      expect(fake.play).toHaveBeenCalledTimes(1);

      list.setEnabled(false); // pause
      list.setEnabled(true); // resume (no reload, src unchanged)

      expect(fake.play).toHaveBeenCalledTimes(2);
      expect(fake.src).toBe("/a.mp3");
      // The element is reused — the `ended` listener is registered only once.
      expect(fake.addEventListener).toHaveBeenCalledTimes(1);

      rand.mockRestore();
    });

    it("creates no audio element when the folder is empty", () => {
      const ctor = vi.fn(() => makeFakeAudio());
      vi.stubGlobal("Audio", ctor);

      const list = createBackgroundPlaylist([]);
      list.setEnabled(true);
      list.setEnabled(false);

      expect(list.trackCount).toBe(0);
      expect(ctor).not.toHaveBeenCalled();
    });

    it("re-picks the only track when a single track ends", () => {
      const fake = makeFakeAudio();
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      const list = createBackgroundPlaylist(["/only.mp3"]);
      list.setEnabled(true);
      expect(fake.src).toBe("/only.mp3");
      expect(fake.play).toHaveBeenCalledTimes(1);

      fake.__emit("ended");
      expect(fake.src).toBe("/only.mp3"); // nothing else to pick
      expect(fake.play).toHaveBeenCalledTimes(2);
    });

    it("retries through unlock() after autoplay is blocked", async () => {
      const fake = makeFakeAudio();
      let nth = 0;
      fake.play = vi.fn(() => {
        nth += 1;
        return nth === 1 ? Promise.reject(new Error("autoplay blocked")) : Promise.resolve();
      });
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      const list = createBackgroundPlaylist(["/a.mp3", "/b.mp3"]);
      list.setEnabled(true); // play() #1 rejects -> blocked
      await flush();

      expect(fake.play).toHaveBeenCalledTimes(1);

      list.unlock(); // a user gesture -> play() #2 resolves
      await flush();

      expect(fake.play).toHaveBeenCalledTimes(2);
    });

    it("does nothing on unlock() when the playlist is idle", () => {
      const fake = makeFakeAudio();
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      createBackgroundPlaylist(["/a.mp3"]).unlock(); // never enabled

      expect(fake.play).not.toHaveBeenCalled();
    });
  });

  /* ------------------- public API over the singleton -------------------- */
  describe("setBackgroundPlaylist / unlockAudio (singleton)", () => {
    it("plays a discovered track on enable and pauses on disable", () => {
      const fake = makeFakeAudio();
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      setBackgroundPlaylist(true);
      expect(fake.play).toHaveBeenCalledTimes(1);
      // The singleton is bound to the real files under src/assets/audio/, so a
      // non-empty URL must have been loaded (no manual track list involved).
      expect(typeof fake.src).toBe("string");
      expect(fake.src.length).toBeGreaterThan(0);

      setBackgroundPlaylist(false);
      expect(fake.pause).toHaveBeenCalledTimes(1);
    });

    it("unlockAudio retries a blocked singleton playlist", async () => {
      const fake = makeFakeAudio();
      let nth = 0;
      fake.play = vi.fn(() => {
        nth += 1;
        return nth === 1 ? Promise.reject(new Error("autoplay blocked")) : Promise.resolve();
      });
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      setBackgroundPlaylist(true);
      await flush();
      expect(fake.play).toHaveBeenCalledTimes(1);

      unlockAudio();
      await flush();
      expect(fake.play).toHaveBeenCalledTimes(2);
    });

    it("unlockAudio is a no-op when nothing is blocked", async () => {
      const fake = makeFakeAudio();
      vi.stubGlobal(
        "Audio",
        vi.fn(() => fake),
      );

      setBackgroundPlaylist(true);
      await flush();
      const calls = fake.play.mock.calls.length;

      unlockAudio(); // not blocked -> no extra attempt
      await flush();
      expect(fake.play.mock.calls.length).toBe(calls);
    });
  });
});
