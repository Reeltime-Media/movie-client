import { describe, expect, it } from "vitest";
import { movieToBanner, movieToPoster } from "@/lib/api/mappers";
import type { ContentListItemRead } from "@/lib/api/types";

const paidMovie = (over: Partial<ContentListItemRead> = {}): ContentListItemRead => ({
  id: "movie-1",
  type: "single",
  slug: "the-last-drive",
  title: "The Last Drive",
  title_km: null,
  description: null,
  genres: ["Action"],
  poster_key: null,
  banner_key: null,
  price_usd: "4.99",
  rating: null,
  runtime: null,
  release_year: 2026,
  is_free: false,
  updated_at: "",
  ...over,
});

describe("movieToPoster", () => {
  it("shows a price tag and pay-marker href for a paid movie with no entitlement", () => {
    const poster = movieToPoster(paidMovie(), 0);
    expect(poster.entitlement).toEqual({ kind: "price", value: "$4.99" });
    expect(poster.watchHref).toContain("/pay/movie");
  });

  it("treats an active subscriber as owning every paid movie, not just purchased ones", () => {
    const poster = movieToPoster(paidMovie(), 0, undefined, false, true);
    expect(poster.entitlement).toEqual({ kind: "none" });
    expect(poster.watchHref).toBe("/watch?slug=the-last-drive");
  });

  it("still honors a direct purchase without a subscription", () => {
    const poster = movieToPoster(paidMovie(), 0, new Set(["movie-1"]), false, false);
    expect(poster.entitlement).toEqual({ kind: "none" });
    expect(poster.watchHref).toBe("/watch?slug=the-last-drive");
  });
});

describe("movieToBanner", () => {
  it("unlocks a paid movie's banner CTA for an active subscriber", () => {
    const banner = movieToBanner(paidMovie(), undefined, false, true);
    expect(banner.watchHref).toBe("/watch?slug=the-last-drive");
  });
});
