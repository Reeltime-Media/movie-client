import { describe, expect, it } from "vitest";

import type { HeroFeaturedSlide } from "@/lib/api/catalog";
import { buildFallbackSlides, slideFromFeatured } from "./hero-slides";

function featured(overrides: Partial<HeroFeaturedSlide> = {}): HeroFeaturedSlide {
  return {
    id: "s1",
    content_type: "custom",
    title: "Summer promo",
    slug: "",
    description: "Big sale",
    genres: [],
    release_year: null,
    rating: null,
    runtime: null,
    poster_key: null,
    banner_key: "hero/banners/x.jpg",
    watch_href: "https://example.com",
    sort_order: 0,
    video_key: null,
    youtube_url: null,
    ...overrides,
  };
}

describe("slideFromFeatured", () => {
  it("maps a custom slide with external link", () => {
    const slide = slideFromFeatured(featured());
    expect(slide.isCustom).toBe(true);
    expect(slide.watchHref).toBe("https://example.com");
    expect(slide.title).toBe("Summer promo");
  });

  it("keeps watchHref null when the custom slide has no link", () => {
    const slide = slideFromFeatured(featured({ watch_href: null }));
    expect(slide.watchHref).toBeNull();
  });

  it("suppresses youtubeUrl when an uploaded video is present", () => {
    const slide = slideFromFeatured(
      featured({ video_key: "hero/videos/x.mp4", youtube_url: "https://youtu.be/abc" }),
    );
    expect(slide.youtubeUrl).toBeNull();
  });

  it("passes youtubeUrl through when there is no uploaded video", () => {
    const slide = slideFromFeatured(featured({ youtube_url: "https://youtu.be/abc" }));
    expect(slide.youtubeUrl).toBe("https://youtu.be/abc");
  });

  it("drops youtubeUrl values that are not parseable YouTube links", () => {
    const slide = slideFromFeatured(featured({ youtube_url: "https://vimeo.com/123" }));
    expect(slide.youtubeUrl).toBeNull();
  });

  it("marks catalog slides as not custom", () => {
    const slide = slideFromFeatured(
      featured({ content_type: "movie", slug: "test", watch_href: "/watch?slug=test" }),
    );
    expect(slide.isCustom).toBe(false);
    expect(slide.watchHref).toBe("/watch?slug=test");
  });
});

describe("buildFallbackSlides", () => {
  it("builds movie fallbacks without video", () => {
    const slides = buildFallbackSlides(
      [
        {
          id: "m1",
          title: "Movie",
          slug: "movie",
          release_year: 2026,
          runtime: "2h",
          rating: null,
          genres: [],
          description: null,
        } as never,
      ],
      [],
    );
    expect(slides).toHaveLength(1);
    expect(slides[0]!.videoSrc).toBeNull();
    expect(slides[0]!.youtubeUrl).toBeNull();
    expect(slides[0]!.isCustom).toBe(false);
  });
});
