/**
 * Integration tests for <AnimatedButton />.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AnimatedButton } from "@/components/AnimatedButton";

describe("AnimatedButton", () => {
  beforeAll(() => {
    if (!("scrollIntoView" in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
        value: vi.fn(),
        writable: true,
      });
    }
  });

  it("renders its children", () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    expect(screen.getByRole("button", { name: /Click me/i })).toBeInTheDocument();
  });

  it("forwards clicks to its onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AnimatedButton onClick={onClick}>Go</AnimatedButton>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies the yes variant by default", () => {
    render(<AnimatedButton>Yes</AnimatedButton>);
    expect(screen.getByRole("button")).toHaveClass(/yes|bg-\[image/);
  });

  it("supports size=lg", () => {
    render(<AnimatedButton size="lg">Big</AnimatedButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/h-16/);
  });
});
