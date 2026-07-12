/**
 * Integration tests for <MovieCard />.
 *
 * Verifies behaviour — not implementation details — using a
 * Testing-Library style that mirrors the real DOM. State changes are
 * triggered with user-event for realism.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "../../../src/components/MovieCard";
import { mockMovie, mockHighRatedMovie, mockMovieNoPoster } from "../../fixtures/movies";
import { renderWithProviders } from "../../utils/test-utils";

// jsdom does not implement `Element.scrollIntoView`; framer-motion probes it.
if (!("scrollIntoView" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: vi.fn(),
    writable: true,
  });
}

describe("MovieCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the movie title as a heading", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      expect(screen.getByRole("heading", { name: mockMovie.title, level: 3 })).toBeInTheDocument();
    });

    it("formats the rating to one decimal place", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      // mockMovie.rating === 7.5
      expect(screen.getByText("7.5")).toBeInTheDocument();
    });

    it("displays every genre tag", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      for (const tag of mockMovie.tags) {
        expect(screen.getByText(tag)).toBeInTheDocument();
      }
    });

    it("renders the description by default (non-compact)", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      expect(screen.getByText(mockMovie.description)).toBeInTheDocument();
    });

    it("hides the description when compact", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} compact />);
      expect(screen.queryByText(mockMovie.description)).not.toBeInTheDocument();
    });

    it("formats year and duration with icons", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      expect(screen.getByText(String(mockMovie.year))).toBeInTheDocument();
      expect(screen.getByText(`${mockMovie.duration}m`)).toBeInTheDocument();
    });
  });

  describe("Poster fallback", () => {
    it("renders the TMDB poster when poster_path is provided", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      const img = screen.getByAltText(`${mockMovie.title} poster`);
      expect(img).toHaveAttribute("src", `https://image.tmdb.org/t/p/w500${mockMovie.poster_path}`);
    });

    it("renders no <img> when poster_path is null (gradient fallback)", () => {
      renderWithProviders(<MovieCard movie={mockMovieNoPoster} onChoose={() => {}} />);
      expect(screen.queryByAltText(`${mockMovieNoPoster.title} poster`)).not.toBeInTheDocument();
    });
  });

  describe("Category badge", () => {
    it("renders the 'Recommended' badge when category=recommended", () => {
      renderWithProviders(
        <MovieCard movie={mockMovie} category="recommended" onChoose={() => {}} />,
      );
      expect(screen.getByText(/Recommended/i)).toBeInTheDocument();
    });

    it("renders the 'Classic' badge when category=classic", () => {
      renderWithProviders(<MovieCard movie={mockMovie} category="classic" onChoose={() => {}} />);
      expect(screen.getByText(/Classic/i)).toBeInTheDocument();
    });

    it("does not render a badge when category is undefined", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      expect(screen.queryByText(/Recommended/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Classic/i)).not.toBeInTheDocument();
    });
  });

  describe("Selection state", () => {
    it("shows 'Choose' label when not selected", () => {
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
      expect(screen.getByRole("button", { name: /Choose/i })).toBeInTheDocument();
    });

    it("shows 'Chosen' label when selected", () => {
      renderWithProviders(<MovieCard movie={mockMovie} selected onChoose={() => {}} />);
      expect(screen.getByRole("button", { name: /Chosen/i })).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("invokes onChoose with the movie when 'Choose' is clicked", async () => {
      const user = userEvent.setup();
      const onChoose = vi.fn();
      renderWithProviders(<MovieCard movie={mockMovie} onChoose={onChoose} />);

      await user.click(screen.getByRole("button", { name: /Choose/i }));

      expect(onChoose).toHaveBeenCalledTimes(1);
      expect(onChoose).toHaveBeenCalledWith(mockMovie);
    });

    it("still calls onChoose after switching to 'Chosen' state", async () => {
      const user = userEvent.setup();
      const onChoose = vi.fn();
      const { rerender } = renderWithProviders(<MovieCard movie={mockMovie} onChoose={onChoose} />);

      // First click — not selected
      await user.click(screen.getByRole("button", { name: /Choose/i }));

      // Re-render with selected=true
      rerender(<MovieCard movie={mockMovie} selected onChoose={onChoose} />);

      await user.click(screen.getByRole("button", { name: /Chosen/i }));

      expect(onChoose).toHaveBeenCalledTimes(2);
      expect(onChoose).toHaveBeenNthCalledWith(2, mockMovie);
    });

    it("invokes onChoose with the correct movie when rendering different props", async () => {
      const user = userEvent.setup();
      const onChoose = vi.fn();
      renderWithProviders(<MovieCard movie={mockHighRatedMovie} onChoose={onChoose} />);

      await user.click(screen.getByRole("button", { name: /Choose/i }));

      expect(onChoose).toHaveBeenCalledWith(mockHighRatedMovie);
    });
  });

  describe("Edge cases", () => {
    it("still renders gracefully for a movie with empty tags", () => {
      renderWithProviders(<MovieCard movie={{ ...mockMovie, tags: [] }} onChoose={() => {}} />);
      expect(screen.getByRole("heading", { name: mockMovie.title })).toBeInTheDocument();
    });

    it("truncates an extremely long title without crashing", () => {
      const longTitle = "A".repeat(500);
      renderWithProviders(
        <MovieCard movie={{ ...mockMovie, title: longTitle }} onChoose={() => {}} />,
      );
      expect(screen.getByRole("heading", { name: longTitle })).toBeInTheDocument();
    });

    it("renders successfully with zero rating", () => {
      renderWithProviders(<MovieCard movie={{ ...mockMovie, rating: 0 }} onChoose={() => {}} />);
      expect(screen.getByText("0.0")).toBeInTheDocument();
    });

    it("renders successfully with max rating (10)", () => {
      renderWithProviders(<MovieCard movie={{ ...mockMovie, rating: 10 }} onChoose={() => {}} />);
      expect(screen.getByText("10.0")).toBeInTheDocument();
    });
  });
});
