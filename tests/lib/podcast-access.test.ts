import { describe, expect, it } from "vitest";
import { podcastLockReason, podcastTitles } from "@/lib/podcast-access";

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

describe("podcastTitles", () => {
  const episode = { title: "Domnak Akum EP65 — ភូមាហែកគុក", title_km: " ភូមាហែកគុក " };

  it("shows the English title first and the Khmer title below it", () => {
    expect(podcastTitles(episode, "en")).toEqual({
      primary: "Domnak Akum EP65 — ភូមាហែកគុក",
      secondary: "ភូមាហែកគុក",
    });
  });

  it("shows the Khmer title first for Khmer viewers", () => {
    expect(podcastTitles(episode, "km")).toEqual({
      primary: "ភូមាហែកគុក",
      secondary: "Domnak Akum EP65 — ភូមាហែកគុក",
    });
  });

  it("falls back to the English title when there is no Khmer title", () => {
    expect(podcastTitles({ title: "Episode", title_km: null }, "km")).toEqual({
      primary: "Episode",
      secondary: null,
    });
  });
});
