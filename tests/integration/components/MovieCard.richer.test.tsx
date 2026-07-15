/**
 * Integration tests for the richer <MovieCard /> details modal.
 *
 * Covers the search-experience refinements that sit on top of the base card:
 *   • the extra TMDB metadata (vote count, popularity, original title) renders
 *     when present and is omitted cleanly when missing,
 *   • runtime is fetched on demand when a search-result movie (duration 0) is
 *     opened in the modal, served from the cached getMovieById.
 *
 * getMovieById is mocked here so the modal's on-demand fetch is deterministic
 * and never touches the network; the rest of @/lib/movies is left real so the
 * `Movie` type and other helpers stay intact.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "../../../src/components/MovieCard";
import { mockMovie } from "../../fixtures/movies";
import { renderWithProviders } from "../../utils/test-utils";

// jsdom does not implement `Element.scrollIntoView`; framer-motion probes it.
if (!("scrollIntoView" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: vi.fn(),
    writable: true,
  });
}

// Keep the real module (for the `Movie` type etc.) but replace getMovieById with
// a controllable mock so the modal's on-demand enrichment is deterministic.
vi.mock("@/lib/movies", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/movies")>();
  return { ...actual, getMovieById: vi.fn() };
});

// vi.mock is hoisted above this import, so it resolves to the mocked
// getMovieById created in the factory above.
import { getMovieById } from "@/lib/movies";

const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /Read more/i }));
  return screen.findByRole("dialog");
};

describe("MovieCard — richer modal metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the vote count when present", async () => {
    const user = userEvent.setup();
    const rich = { ...mockMovie, voteCount: 1234 };
    renderWithProviders(<MovieCard movie={rich} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).getByText("1,234")).toBeInTheDocument();
    expect(within(dialog).getByText(/votes/i)).toBeInTheDocument();
  });

  it("omits the vote count when it is missing or zero", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    const dialog = await openModal(user);
    // mockMovie has no voteCount; nothing about votes should render.
    expect(within(dialog).queryByText(/votes/i)).not.toBeInTheDocument();
  });

  it("shows popularity when present", async () => {
    const user = userEvent.setup();
    const rich = { ...mockMovie, popularity: 88.4 };
    renderWithProviders(<MovieCard movie={rich} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).getByText("popularity")).toBeInTheDocument();
    expect(within(dialog).getByText("88.4")).toBeInTheDocument();
  });

  it("omits popularity when it is missing or zero", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).queryByText(/popularity/i)).not.toBeInTheDocument();
  });

  it("shows the original title when it differs from the title", async () => {
    const user = userEvent.setup();
    const foreign = { ...mockMovie, title: "The Workshop", originalTitle: "El Taller" };
    renderWithProviders(<MovieCard movie={foreign} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).getByText(/Originally:/i)).toBeInTheDocument();
    expect(within(dialog).getByText("El Taller")).toBeInTheDocument();
  });

  it("omits the original title when it matches the title", async () => {
    const user = userEvent.setup();
    const same = { ...mockMovie, title: "Same Title", originalTitle: "Same Title" };
    renderWithProviders(<MovieCard movie={same} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).queryByText(/Originally:/i)).not.toBeInTheDocument();
  });

  it("omits the original title when it is missing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(within(dialog).queryByText(/Originally:/i)).not.toBeInTheDocument();
  });
});

describe("MovieCard — on-demand runtime enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the runtime on demand when a search-result modal is opened", async () => {
    const user = userEvent.setup();
    // A /search/movie result: duration 0 → runtime unknown. The modal must
    // fetch the details (cached) and fill the runtime in.
    const searchMovie = {
      ...mockMovie,
      id: "909090",
      duration: 0,
      voteCount: null,
      popularity: null,
      originalTitle: null,
    };
    const enriched = { ...searchMovie, duration: 96 };
    vi.mocked(getMovieById).mockResolvedValue(enriched);

    renderWithProviders(<MovieCard movie={searchMovie} onChoose={() => {}} />);

    const dialog = await openModal(user);
    expect(await within(dialog).findByText("96m")).toBeInTheDocument();
    expect(getMovieById).toHaveBeenCalledTimes(1);
    expect(getMovieById).toHaveBeenCalledWith("909090");
  });

  it("survives a failed detail fetch without crashing or rendering a placeholder", async () => {
    const user = userEvent.setup();
    const searchMovie = { ...mockMovie, id: "111111", duration: 0 };
    vi.mocked(getMovieById).mockResolvedValue(null);

    renderWithProviders(<MovieCard movie={searchMovie} onChoose={() => {}} />);

    const dialog = await openModal(user);
    // The title still renders…
    expect(within(dialog).getByRole("heading", { name: mockMovie.title })).toBeInTheDocument();
    // …and once the fetch settles the loader disappears (no stuck spinner, no
    // "N/A" placeholder — the runtime slot just stays omitted).
    await waitFor(() => {
      expect(within(dialog).queryByLabelText("Loading runtime")).not.toBeInTheDocument();
    });
    expect(within(dialog).queryByText(/^\d+m$/)).not.toBeInTheDocument();
  });

  it("does not fetch details when the movie already carries a runtime", async () => {
    const user = userEvent.setup();
    // mockMovie has duration 120 → no enrichment, no fetch.
    renderWithProviders(<MovieCard movie={mockMovie} onChoose={() => {}} />);

    await openModal(user);
    expect(getMovieById).not.toHaveBeenCalled();
  });
});
