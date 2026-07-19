import { describe, expect, it } from "vitest";
import { isWatchCompleted, qualifiesAsWatch } from "@/lib/watch/progress";

describe("qualifiesAsWatch", () => {
  it("qualifies after 30 seconds regardless of duration", () => {
    expect(qualifiesAsWatch(30, 0)).toBe(true);
    expect(qualifiesAsWatch(29, 0)).toBe(false);
  });

  it("qualifies at 10% of a short video", () => {
    expect(qualifiesAsWatch(6, 60)).toBe(true);
    expect(qualifiesAsWatch(5, 60)).toBe(false);
  });
});

describe("isWatchCompleted", () => {
  it("completes at 90% of duration", () => {
    expect(isWatchCompleted(90, 100)).toBe(true);
    expect(isWatchCompleted(89, 100)).toBe(false);
  });

  it("never completes without a known duration", () => {
    expect(isWatchCompleted(1000, 0)).toBe(false);
  });
});
