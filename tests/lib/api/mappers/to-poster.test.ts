import { describe, expect, it } from "vitest";
import { movieToBanner, movieToPoster, seriesToPoster } from "@/lib/api/mappers";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";

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

const series = (over: Partial<SeriesRead> = {}): SeriesRead => ({
  id: "series-1",
  slug: "echo-valley",
  title: "Echo Valley",
  title_km: null,
  description: null,
  genres: ["Drama"],
  release_year: 2026,
  rating: null,
  monthly_price_usd: "4.99",
  poster_key: null,
  banner_key: null,
  trailer_url: null,
  is_published: true,
  is_short_movie: false,
  free_episode_count: 0,
  created_at: "",
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

describe("seriesToPoster", () => {
  it("uses free_episode_count for Watch now without prefetching seasons", () => {
    const poster = seriesToPoster(series({ free_episode_count: 2 }), 0);
    expect(poster.watchLabel).toBe("Watch now");
    expect(poster.watchHref).toBe("/watch/series/echo-valley/1/1");
  });

  it("keeps View series when there are no free episodes", () => {
    const poster = seriesToPoster(series({ free_episode_count: 0 }), 0);
    expect(poster.watchLabel).toBe("View series");
  });
});
