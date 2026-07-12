/**
 * Integration tests for the shared <PageShell /> wrapper.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "@/components/PageShell";

describe("PageShell", () => {
  beforeAll(() => {
    if (!("scrollIntoView" in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
        value: vi.fn(),
        writable: true,
      });
    }
  });

  it("renders children", () => {
    render(
      <PageShell>
        <span data-testid="child">inside</span>
      </PageShell>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides a <main> landmark", () => {
    render(
      <PageShell>
        <span>inside</span>
      </PageShell>,
    );
    // jsdom reports the landmark even though full CSS layout is missing.
    expect(document.querySelector("main")).not.toBeNull();
  });

  it("forwards custom className", () => {
    const { container } = render(
      <PageShell className="custom-class">
        <span>x</span>
      </PageShell>,
    );
    expect(container.firstChild?.firstChild).toHaveClass("custom-class");
  });
});
