import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Global test setup
// This file runs before all tests

// Mock window.location and window.history for router tests
const originalLocation = window.location;
const originalHistory = window.history;

beforeAll(() => {
  // Mock window.matchMedia for responsive tests
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock window.location for tests that need it
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      ...originalLocation,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      toString: () => originalLocation.toString(),
    },
  });

  // Mock console.error to suppress warnings during tests
  // but still allow them to be visible
  const originalConsoleError = console.error;
  console.error = vi.fn((...args) => {
    // Filter out common warnings that don't affect test outcomes
    const message = args[0];
    const isReactWarning = typeof message === "string" &&
      (message.includes("Warning:") ||
        message.includes("was called more than once") ||
        message.includes("Missing a title") ||
        message.includes("React does not recognize"));

    const isNextTickWarning = typeof message === "string" &&
      message.includes("setTimeout/RunTask has not been defined");

    if (!isReactWarning && !isNextTickWarning) {
      originalConsoleError(...args);
    }
  });

  // Mock requestAnimationFrame for animation tests
  global.requestAnimationFrame = vi.fn((cb) => cb(0));
  global.cancelAnimationFrame = vi.fn();
});

afterAll(() => {
  // Restore original console.error
  console.error.mockRestore?.();
  Object.defineProperty(window, "location", {
    writable: true,
    value: originalLocation,
  });
  Object.defineProperty(window, "history", {
    writable: true,
    value: originalHistory,
  });
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Mock localStorage for tests that need it
// This is done in the individual test files that need it
// to avoid polluting all tests with localStorage mocks

// Mock sessionStorage for tests that need it
export const mockSessionStorage = () => {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
      length: Object.keys(store).length,
    };
  })();

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
  });

  return sessionStorageMock;
};

// Mock localStorage for tests that need it
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
      length: Object.keys(store).length,
    };
  })();

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  return localStorageMock;
};
