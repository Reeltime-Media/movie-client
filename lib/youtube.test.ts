import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl } from "@/lib/youtube";

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
