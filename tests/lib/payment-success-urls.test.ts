import { afterEach, describe, expect, it, vi } from "vitest";
import {
  moviePaymentSuccessUrl,
  seriesSubscriptionSuccessUrl,
} from "@/lib/payment-success-urls";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("moviePaymentSuccessUrl", () => {
  it("builds an absolute success URL with the watch page as next", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://reeltime.example");
    expect(moviePaymentSuccessUrl("the-last-drive")).toBe(
      `https://reeltime.example/payment/success?next=${encodeURIComponent("/watch?slug=the-last-drive")}`,
    );
  });

  it("strips a trailing slash from the configured origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://reeltime.example/");
    expect(
      moviePaymentSuccessUrl("x").startsWith("https://reeltime.example/payment/success"),
    ).toBe(true);
  });

  it("falls back to localhost outside the browser when unconfigured", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(moviePaymentSuccessUrl("x").startsWith("http://localhost:3000/")).toBe(true);
  });
});

describe("seriesSubscriptionSuccessUrl", () => {
  it("includes season and episode in the next path", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://reeltime.example");
    expect(seriesSubscriptionSuccessUrl("echo-valley", { season: "2", episode: "5" })).toBe(
      `https://reeltime.example/payment/success?next=${encodeURIComponent("/watch/series/echo-valley/2/5")}`,
    );
  });

  it("defaults invalid or missing season/episode to 1", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://reeltime.example");
    expect(seriesSubscriptionSuccessUrl("echo-valley", { season: "0", episode: "abc" })).toContain(
      encodeURIComponent("/watch/series/echo-valley/1/1"),
    );
    expect(seriesSubscriptionSuccessUrl("echo-valley")).toContain(
      encodeURIComponent("/watch/series/echo-valley/1/1"),
    );
  });
});
