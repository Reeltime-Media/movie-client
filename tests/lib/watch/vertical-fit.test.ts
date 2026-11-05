import { describe, expect, it } from "vitest";
import { fitVerticalPicture } from "@/lib/watch/vertical-fit";

describe("fitVerticalPicture", () => {
  it("makes the picture as wide as a portrait phone screen", () => {
    const fit = fitVerticalPicture(591, 1280);
    expect(fit).toEqual({ w: 1868, h: 1051 });
    // the 9:16 picture inside the frame is 591 px wide, the full screen width
    expect(Math.round((fit!.h * 9) / 16)).toBe(591);
  });

  it("limits the picture by the player height when the player is short", () => {
    // a phone player 390 wide but only 600 tall: the picture is 337 x 600
    const fit = fitVerticalPicture(390, 600);
    expect(fit).toEqual({ w: 1067, h: 600 });
    expect(Math.round((fit!.h * 9) / 16)).toBeLessThanOrEqual(390);
  });

  it("gives a landscape player the plain 16:9 fit", () => {
    expect(fitVerticalPicture(800, 450)).toEqual({ w: 800, h: 450 });
    expect(fitVerticalPicture(2400, 1080)).toEqual({ w: 1920, h: 1080 });
  });

  it("returns null until the player has a size", () => {
    expect(fitVerticalPicture(0, 500)).toBeNull();
    expect(fitVerticalPicture(500, 0)).toBeNull();
    expect(fitVerticalPicture(Number.NaN, 500)).toBeNull();
  });
});
