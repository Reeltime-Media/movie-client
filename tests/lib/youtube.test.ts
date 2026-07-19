import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl, youtubeHeroEmbedUrl } from "@/lib/youtube";

describe("youtubeEmbedUrl", () => {
  it("handles youtu.be short links", () => {
    expect(youtubeEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube.com/embed/abc123?rel=0",
    );
  });

  it("handles watch?v= links", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123?rel=0",
    );
  });

  it("handles /embed/ links and the autoplay option", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/embed/abc123?x=1", { autoplay: true })).toBe(
      "https://www.youtube.com/embed/abc123?rel=0&autoplay=1",
    );
  });

  it("returns null for non-YouTube, invalid, or missing URLs", () => {
    expect(youtubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
    expect(youtubeEmbedUrl("not a url")).toBeNull();
    expect(youtubeEmbedUrl(null)).toBeNull();
    expect(youtubeEmbedUrl(undefined)).toBeNull();
  });
});

describe("youtubeHeroEmbedUrl", () => {
  it("builds a muted autoplay nocookie embed", () => {
    const url = youtubeHeroEmbedUrl("https://www.youtube.com/watch?v=abc123");
    expect(url).toContain("https://www.youtube-nocookie.com/embed/abc123?");
    expect(url).toContain("autoplay=1");
    expect(url).toContain("mute=1");
    expect(url).toContain("controls=0");
    expect(url).toContain("enablejsapi=1");
  });

  it("returns null for non-youtube urls", () => {
    expect(youtubeHeroEmbedUrl("https://vimeo.com/123")).toBeNull();
    expect(youtubeHeroEmbedUrl(null)).toBeNull();
  });
});
