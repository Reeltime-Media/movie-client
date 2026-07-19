import { describe, expect, it } from "vitest";
import { parseApiErrorMessage } from "@/lib/api/core";

describe("parseApiErrorMessage", () => {
  it("passes through non-empty strings", () => {
    expect(parseApiErrorMessage("Not found")).toBe("Not found");
  });

  it("joins FastAPI validation arrays of objects and strings", () => {
    expect(parseApiErrorMessage([{ msg: "field required" }, "bad slug"])).toBe(
      "field required. bad slug",
    );
  });

  it("reads message objects", () => {
    expect(parseApiErrorMessage({ message: "boom" })).toBe("boom");
  });

  it("falls back when detail is unusable", () => {
    expect(parseApiErrorMessage(undefined)).toBe("Request failed");
    expect(parseApiErrorMessage("", "Custom")).toBe("Custom");
    expect(parseApiErrorMessage([], "Custom")).toBe("Custom");
    expect(parseApiErrorMessage("   ")).toBe("Request failed");
  });
});
