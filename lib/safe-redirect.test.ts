import { describe, expect, it } from "vitest";
import { safeCheckoutUrl, safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("allows known same-site paths, preserving query strings", () => {
    expect(safeRedirectPath("/watch?slug=x")).toBe("/watch?slug=x");
    expect(safeRedirectPath("/payment/success?next=%2Fwatch")).toBe(
      "/payment/success?next=%2Fwatch",
    );
    expect(safeRedirectPath("/")).toBe("/");
  });

  it("rejects external, protocol-relative, and backslash URLs", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("/watch\\..\\etc")).toBe("/");
  });

  it("rejects unknown paths and honors the fallback", () => {
    expect(safeRedirectPath("/admin", "/movies")).toBe("/movies");
    expect(safeRedirectPath(null, "/movies")).toBe("/movies");
    expect(safeRedirectPath(undefined)).toBe("/");
  });
});

describe("safeCheckoutUrl", () => {
  it("accepts Baray checkout hosts and their subdomains", () => {
    expect(safeCheckoutUrl("https://pay.baray.io/checkout/123")).toBe(
      "https://pay.baray.io/checkout/123",
    );
    expect(safeCheckoutUrl("https://sub.checkout.baray.io/x")).toBe(
      "https://sub.checkout.baray.io/x",
    );
  });

  it("rejects other hosts, non-http protocols, and invalid URLs", () => {
    expect(() => safeCheckoutUrl("https://evil.example/pay")).toThrow();
    expect(() => safeCheckoutUrl("https://baray.io.evil.example/pay")).toThrow();
    expect(() => safeCheckoutUrl("javascript:alert(1)")).toThrow();
    expect(() => safeCheckoutUrl("not a url")).toThrow();
  });
});
