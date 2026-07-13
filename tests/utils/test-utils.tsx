/**
 * Custom render functions for testing components with required providers.
 * This file exports utilities for rendering components in a test environment
 * that matches the real application as closely as possible.
 */

import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryRouter } from "@tanstack/react-router";
import { routeTree } from "../../src/routeTree.gen";

// ============================================================================
// QueryClient Provider
// ============================================================================

/**
 * QueryClient instance for testing.
 * Each test should use its own QueryClient to ensure isolation.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests for deterministic behavior
        gcTime: Infinity, // Keep cache forever during tests
        staleTime: Infinity, // Never refetch automatically
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => null,
      warn: () => null,
      error: () => null,
    },
  });
}

function QueryClientTestProvider({
  children,
  client,
}: {
  children: ReactNode;
  client: QueryClient;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// ============================================================================
// Router Provider
// ============================================================================

function TestRouterProvider({
  children,
  initialEntries = ["/"],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  const router = createMemoryRouter({
    routeTree,
    initialEntries,
  });

  return <RouterProvider router={router}>{children}</RouterProvider>;
}

// ============================================================================
// Main Test Providers
// ============================================================================

/**
 * AllProviders wrapper - includes all necessary providers for testing.
 * Use this for most component tests.
 */
export function AllProviders({
  children,
  queryClient,
  router = false,
  initialRoute = "/",
}: {
  children: ReactNode;
  queryClient?: QueryClient;
  router?: boolean | string[];
  initialRoute?: string;
}) {
  const client = queryClient ?? createTestQueryClient();

  // Wrap children with all providers
  let wrappedChildren = (
    <QueryClientTestProvider client={client}>{children}</QueryClientTestProvider>
  );

  // Add router if requested
  if (router) {
    const initialEntries = typeof router === "boolean" ? [initialRoute] : router;
    wrappedChildren = (
      <TestRouterProvider initialEntries={initialEntries}>{wrappedChildren}</TestRouterProvider>
    );
  }

  return wrappedChildren;
}

// ============================================================================
// Custom Render Functions
// ============================================================================

/**
 * Options for custom render functions.
 */
export interface TestRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Whether to wrap with QueryClientProvider.
   * @default true
   */
  withQueryClient?: boolean;

  /**
   * Whether to wrap with RouterProvider.
   * @default false
   */
  withRouter?: boolean | string[];

  /**
   * Custom QueryClient to use.
   */
  queryClient?: QueryClient;

  /**
   * Initial route for router.
   * @default "/"
   */
  initialRoute?: string;
}

/**
 * Custom render function that wraps components with QueryClient.
 * Use this for components that use TanStack Query.
 */
export function renderWithQueryClient(ui: ReactElement, options?: TestRenderOptions): RenderResult {
  const client = options?.queryClient ?? createTestQueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientTestProvider client={client}>{children}</QueryClientTestProvider>
  );

  return render(ui, {
    ...options,
    wrapper,
  });
}

/**
 * Custom render function that wraps components with QueryClient and Router.
 * Use this for full integration tests with routing.
 */
export function renderWithProviders(ui: ReactElement, options?: TestRenderOptions): RenderResult {
  const client = options?.queryClient ?? createTestQueryClient();
  const withRouter = options?.withRouter ?? false;
  const initialRoute = options?.initialRoute ?? "/";

  const wrapper = ({ children }: { children: ReactNode }) => {
    let wrapped = <QueryClientTestProvider client={client}>{children}</QueryClientTestProvider>;

    if (withRouter) {
      const initialEntries = typeof withRouter === "boolean" ? [initialRoute] : withRouter;
      wrapped = <TestRouterProvider initialEntries={initialEntries}>{wrapped}</TestRouterProvider>;
    }

    return wrapped;
  };

  return render(ui, {
    ...options,
    wrapper,
  });
}

/**
 * Simple render function without providers.
 * Use this for simple components that don't need QueryClient or Router.
 */
export function renderSimple(ui: ReactElement, options?: RenderOptions): RenderResult {
  return render(ui, options);
}

// ============================================================================
// Re-exports from @testing-library/react
// ============================================================================

export {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  findByRole,
  findByText,
  findByTestId,
  getByRole,
  getByText,
  getByTestId,
  queryByRole,
  queryByText,
  queryByTestId,
  getAllByRole,
  getAllByText,
  getAllByTestId,
  within,
} from "@testing-library/react";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wait for a specific amount of time.
 * Use this sparingly - prefer waitFor with conditions.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for animations to complete.
 * Default timeout matches CSS transition durations.
 */
export async function waitForAnimations(timeout = 500): Promise<void> {
  await waitFor(
    () => {
      // Check if any animation is still running
      const elements = document.querySelectorAll("*[style*='transition'],*[style*='animation']");
      return Array.from(elements).every((el) => {
        const style = window.getComputedStyle(el);
        return style.transitionDuration === "0s" && style.animationDuration === "0s";
      });
    },
    { timeout },
  );
}

/**
 * Assert that a function throws an error.
 * More readable wrapper around expect().toThrow().
 */
export async function expectToThrow(
  fn: () => unknown,
  errorMessage?: string | RegExp,
): Promise<void> {
  try {
    await fn();
    throw new Error("Expected function to throw but it did not");
  } catch (error) {
    if (errorMessage) {
      if (typeof errorMessage === "string") {
        if (!(error as Error).message.includes(errorMessage)) {
          throw new Error(
            `Expected error message to include "${errorMessage}", got: ${(error as Error).message}`,
          );
        }
      } else if (!errorMessage.test((error as Error).message)) {
        throw new Error(
          `Expected error message to match ${errorMessage}, got: ${(error as Error).message}`,
        );
      }
    }
  }
}

// ============================================================================
// Test Data Constants
// ============================================================================

/**
 * Default test date string (ISO format).
 */
export const TEST_DATE = "2026-07-12";

/**
 * Default test time string (HH:mm format).
 */
export const TEST_TIME = "19:00";

/**
 * Default test timeout for async operations.
 */
export const TEST_TIMEOUT = 10000;
