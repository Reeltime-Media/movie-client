import { describe, expect, it } from "vitest";
import {
  collectGenreLabels,
  filterByGenreLabel,
  genreKeyFromLabel,
  matchesGenre,
  matchesGenreLabel,
  matchesSearch,
  type CatalogSearchable,
} from "@/lib/catalog-filter";

const item = (over: Partial<CatalogSearchable> = {}): CatalogSearchable => ({
  title: "The Last Drive",
  description: "A rideshare driver picks up the wrong passenger.",
  genres: ["Action", "Thriller"],
  ...over,
});

describe("matchesSearch", () => {
  it("matches everything for an empty or whitespace query", () => {
    expect(matchesSearch(item(), "")).toBe(true);
    expect(matchesSearch(item(), "   ")).toBe(true);
  });

  it("matches title case-insensitively", () => {
    expect(matchesSearch(item(), "last DRIVE")).toBe(true);
  });

  it("matches description and genres", () => {
    expect(matchesSearch(item(), "rideshare")).toBe(true);
    expect(matchesSearch(item(), "thriller")).toBe(true);
  });

  it("rejects non-matching queries", () => {
    expect(matchesSearch(item(), "space opera")).toBe(false);
  });
});

describe("genreKeyFromLabel", () => {
  it("maps API labels to filter keys, normalizing case and separators", () => {
    expect(genreKeyFromLabel("Thriller")).toBe("genreThriller");
    expect(genreKeyFromLabel("sci-fi")).toBe("genreSciFi");
    expect(genreKeyFromLabel("SCI FI")).toBe("genreSciFi");
  });

  it("falls back to genreAll for unknown or empty labels", () => {
    expect(genreKeyFromLabel("Documentary")).toBe("genreAll");
    expect(genreKeyFromLabel("")).toBe("genreAll");
    expect(genreKeyFromLabel(null)).toBe("genreAll");
  });
});

describe("matchesGenre / matchesGenreLabel", () => {
  it("genreAll matches everything", () => {
    expect(matchesGenre(item(), "genreAll")).toBe(true);
  });

  it("matches by mapped genre key", () => {
    expect(matchesGenre(item(), "genreAction")).toBe(true);
    expect(matchesGenre(item(), "genreHorror")).toBe(false);
  });

  it("matches raw labels with normalization and treats empty as match-all", () => {
    expect(matchesGenreLabel(item({ genres: ["Sci-Fi"] }), "sci fi")).toBe(true);
    expect(matchesGenreLabel(item(), null)).toBe(true);
  });
});

describe("filterByGenreLabel", () => {
  it("returns a copy for empty labels and filters otherwise", () => {
    const items = [item(), item({ genres: ["Drama"] })];
    expect(filterByGenreLabel(items, null)).toHaveLength(2);
    expect(filterByGenreLabel(items, "Drama")).toHaveLength(1);
  });
});

describe("collectGenreLabels", () => {
  it("orders by frequency then name, keeping first-seen casing", () => {
    const items = [
      item({ genres: ["Drama"] }),
      item({ genres: ["drama", "Action"] }),
      item({ genres: ["Action"] }),
    ];
    expect(collectGenreLabels(items)).toEqual(["Action", "Drama"]);
  });

  it("ignores blank genre entries and duplicate genres within one item", () => {
    const items = [item({ genres: ["", "Action", "action"] })];
    expect(collectGenreLabels(items)).toEqual(["Action"]);
  });
});
