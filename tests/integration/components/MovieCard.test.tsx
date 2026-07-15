/**
 * Integration tests for <MovieCard />.
 *
 * Verifies behaviour — not implementation details — using a
 * Testing-Library style that mirrors the real DOM. State changes are
 * triggered with user-event for realism.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
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

describe("MovieCard — Read more link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a clearly visible 'Read more' link on each card", () => {
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
    // Presence + accessible name is asserted here; the card's entrance opacity
    // is driven by framer-motion which stays at its initial frame in jsdom, so
    // we assert membership in the document rather than computed visibility.
    const readMore = screen.getByRole("button", { name: /Read more/i });
    expect(readMore).toBeInTheDocument();
    expect(readMore).toHaveTextContent(/Read more/i);
  });

  it("still shows the 'Read more' link when the card is compact", () => {
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} compact />);
    expect(screen.getByRole("button", { name: /Read more/i })).toBeInTheDocument();
  });

  it("does not name the link after the title, so journey selectors that click a title-named button keep targeting Choose", () => {
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);
    const readMore = screen.getByRole("button", { name: /Read more/i });
    expect(readMore).toHaveAccessibleName("Read more");
    // A title-based selector like /Test Movie/i finds no button at all.
    expect(screen.queryByRole("button", { name: /Test Movie/i })).not.toBeInTheDocument();
  });
});

describe("MovieCard — details modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens an animated dialog when the 'Read more' link is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // The modal's own visible heading re-presents the title.
    expect(within(dialog).getByRole("heading", { name: mockMovie.title })).toBeInTheDocument();
    // The full description is shown inside the dialog.
    expect(within(dialog).getByText(mockMovie.description)).toBeInTheDocument();
  });

  it("opens the same modal when the card surface is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    // Click a non-interactive part (the title) — it bubbles to the card surface.
    await user.click(screen.getByRole("heading", { name: mockMovie.title, level: 3 }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("expands to show every genre tag, not just the first three", async () => {
    const user = userEvent.setup();
    const manyTags = { ...mockMovie, tags: ["One", "Two", "Three", "Four", "Five"] };
    renderWithProviders(<MovieCard movie={manyTags} onChoose={() => {}} />);

    // The card truncates to the first three.
    expect(screen.queryByText("Five")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    for (const tag of manyTags.tags) {
      expect(within(dialog).getByText(tag)).toBeInTheDocument();
    }
  });

  it("shows the full description, rating, year and duration in the modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(mockMovie.description)).toBeInTheDocument();
    expect(within(dialog).getByText("7.5")).toBeInTheDocument();
    expect(within(dialog).getByText(String(mockMovie.year))).toBeInTheDocument();
    expect(within(dialog).getByText(`${mockMovie.duration}m`)).toBeInTheDocument();
  });

  it("also surfaces the editorial badge inside the modal when present", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} category="recommended" onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Recommended/i)).toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Close/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("falls back to a gradient when the movie has no poster", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovieNoPoster} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).queryByAltText(`${mockMovieNoPoster.title} poster`),
    ).not.toBeInTheDocument();
  });

  it("shows the cinematic backdrop as a hero image when a backdrop is available", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    const backdrop = within(dialog).getByAltText(`${mockMovie.title} backdrop`);
    expect(backdrop).toHaveAttribute(
      "src",
      `https://image.tmdb.org/t/p/w1280${mockMovie.backdrop_path}`,
    );
    // The poster column still carries the poster alongside the backdrop hero.
    expect(within(dialog).getByAltText(`${mockMovie.title} poster`)).toBeInTheDocument();
  });

  it("shows no backdrop hero but keeps the poster when the movie has no backdrop", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={{ ...mockMovie, backdrop_path: null }} onChoose={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByAltText(`${mockMovie.title} backdrop`)).not.toBeInTheDocument();
    expect(within(dialog).getByAltText(`${mockMovie.title} poster`)).toBeInTheDocument();
  });

  it("shows the full release date and original language when available", async () => {
    const user = userEvent.setup();
    const richMovie = { ...mockMovie, releaseDate: "2024-07-12", originalLanguage: "en" };
    renderWithProviders(<MovieCard movie={richMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    // Full date instead of the bare year, and a human-readable language name.
    expect(within(dialog).getByText("Jul 12, 2024")).toBeInTheDocument();
    expect(within(dialog).getByText("English")).toBeInTheDocument();
    expect(within(dialog).getByText(`${mockMovie.duration}m`)).toBeInTheDocument();
  });

  it("falls back to the release year and omits the language row when those fields are missing", async () => {
    const user = userEvent.setup();
    // mockMovie carries no releaseDate / originalLanguage, so the modal must
    // degrade to the year and skip the language row — never an empty chip.
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(String(mockMovie.year))).toBeInTheDocument();
    expect(within(dialog).queryByText("Jul 12, 2024")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("English")).not.toBeInTheDocument();
  });

  it("does not render an overview placeholder when the movie has a description", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(mockMovie.description)).toBeInTheDocument();
    expect(
      within(dialog).queryByText(/No overview available for this title/i),
    ).not.toBeInTheDocument();
  });

  it("stays populated with a screen-reader overview fallback when there is no overview", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={{ ...mockMovie, description: "" }} onChoose={() => {}} />,
    );

    await user.click(screen.getByRole("button", { name: /Read more/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: mockMovie.title })).toBeInTheDocument();
    expect(within(dialog).getByText("7.5")).toBeInTheDocument();
    // No *visible* empty-state — the placeholder is screen-reader-only.
    expect(within(dialog).getByText(/No overview available for this title/i)).toBeInTheDocument();
  });
});

describe("MovieCard — modal + Choose interaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does NOT open the modal when 'Choose' is clicked on the card", async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={onChoose} />);

    await user.click(screen.getByRole("button", { name: /Choose/i }));

    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith(mockMovie);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("selects the film and closes when 'Choose this film' is clicked from inside the modal", async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={onChoose} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Choose this film/i }));

    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith(mockMovie);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("reflects the chosen state inside the modal once selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} selected onChoose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /Read more/i }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /Chosen/i })).toBeInTheDocument();
  });
});
