import { describe, expect, it } from "vitest";
import { formatPodcastClock, podcastHeadline, podcastLockReason } from "@/lib/podcast-access";

const viewer = { isFree: false, loggedIn: false, hasSubscription: false, isAdmin: false };

describe("podcastLockReason", () => {
  it("asks guests to sign in for a paid episode", () => {
    expect(podcastLockReason(viewer)).toBe("signin");
  });

  it("asks a signed-in viewer without a plan to subscribe", () => {
    expect(podcastLockReason({ ...viewer, loggedIn: true })).toBe("subscribe");
  });

  it("lets an active subscriber listen", () => {
    expect(podcastLockReason({ ...viewer, loggedIn: true, hasSubscription: true })).toBeNull();
  });

  it("lets anyone play a free episode, even a guest", () => {
    expect(podcastLockReason({ ...viewer, isFree: true })).toBeNull();
  });

  it("lets admins listen without a plan", () => {
    expect(podcastLockReason({ ...viewer, loggedIn: true, isAdmin: true })).toBeNull();
  });

  it("does not treat a subscription as enough when the viewer is signed out", () => {
    expect(podcastLockReason({ ...viewer, hasSubscription: true })).toBe("signin");
  });
});

describe("podcastHeadline", () => {
  const episode = { title: "Domnak Akum EP65 — ភូមាហែកគុក", title_km: " ភូមាហែកគុក " };

  it("makes the Khmer name the headline with the series and number above it", () => {
    expect(podcastHeadline(episode)).toEqual({ eyebrow: "Domnak Akum EP65", title: "ភូមាហែកគុក" });
  });

  it("keeps a title that does not contain the Khmer name as the label", () => {
    expect(podcastHeadline({ title: "Episode 7", title_km: "ភូមា" })).toEqual({
      eyebrow: "Episode 7",
      title: "ភូមា",
    });
  });

  it("has no label when the title is only the Khmer name", () => {
    expect(podcastHeadline({ title: "ភូមា", title_km: "ភូមា" })).toEqual({ eyebrow: null, title: "ភូមា" });
  });

  it("falls back to the English title when there is no Khmer title", () => {
    expect(podcastHeadline({ title: "Episode", title_km: null })).toEqual({ eyebrow: null, title: "Episode" });
    expect(podcastHeadline({ title: "Episode", title_km: "  " })).toEqual({ eyebrow: null, title: "Episode" });
  });
});

describe("formatPodcastClock", () => {
  it("formats minutes and seconds", () => {
    expect(formatPodcastClock(5)).toBe("0:05");
    expect(formatPodcastClock(38 * 60 + 2)).toBe("38:02");
  });

  it("adds hours from one hour up", () => {
    expect(formatPodcastClock(3600 + 2 * 60 + 3)).toBe("1:02:03");
  });

  it("shows 0:00 for unusable values", () => {
    expect(formatPodcastClock(-4)).toBe("0:00");
    expect(formatPodcastClock(Number.NaN)).toBe("0:00");
    expect(formatPodcastClock(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});
