/**
 * Sample streams that return HTTP 200 for anonymous playback.
 */
export const SAMPLE_VIDEO_SOURCES = [
  {
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    type: "video/mp4",
  },
  {
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    type: "video/mp4",
  },
] as const;

export const SAMPLE_VIDEO_ATTRIBUTION =
  "Primary clip: flower.mp4 from MDN interactive examples (CC0). Fallback: W3Schools Big Buck Bunny sample.";
