import { describe, expect, it } from "vitest";
import { parsePaypalReturn } from "@/lib/pay/paypal-return";
import { safePaypalUrl } from "@/lib/safe-redirect";

const parse = (query: string) => parsePaypalReturn(new URLSearchParams(query));

describe("parsePaypalReturn", () => {
  it("reads the order id PayPal adds as `token`, plus our own params", () => {
    const ret = parse("intent=pp-1&client=web&next=%2Fwatch%3Fslug%3Dmy-movie&token=5O190127TN364715T");
    expect(ret).toEqual({
      orderId: "5O190127TN364715T",
      intentId: "pp-1",
      next: "/watch?slug=my-movie",
      client: "web",
      cancelled: false,
    });
  });

  it("flags a cancelled return and an app return", () => {
    const ret = parse("intent=pp-1&client=app&cancelled=1&token=ABCDE12345");
    expect(ret.cancelled).toBe(true);
    expect(ret.client).toBe("app");
  });

  it("rejects a missing or malformed order id", () => {
    expect(parse("intent=pp-1").orderId).toBeNull();
    expect(parse("token=abc").orderId).toBeNull();
    expect(parse("token=../../etc/passwd").orderId).toBeNull();
    expect(parse("token=" + "A".repeat(65)).orderId).toBeNull();
  });

  it("never lets `next` leave the site", () => {
    expect(parse("next=https%3A%2F%2Fevil.example&token=ABCDE12345").next).toBe("/");
    expect(parse("next=%2F%2Fevil.example&token=ABCDE12345").next).toBe("/");
    expect(parse("next=%2Fadmin&token=ABCDE12345").next).toBe("/");
    expect(parse("token=ABCDE12345").next).toBe("/");
  });

  it("treats an unknown client as web", () => {
    expect(parse("client=banana&token=ABCDE12345").client).toBe("web");
  });
});

describe("safePaypalUrl", () => {
  it("accepts paypal.com and its subdomains over https", () => {
    expect(safePaypalUrl("https://www.paypal.com/checkoutnow?token=X")).toContain("paypal.com");
    expect(safePaypalUrl("https://www.sandbox.paypal.com/checkoutnow?token=X")).toContain("sandbox.paypal.com");
  });

  it("rejects other hosts, look-alikes, http and odd protocols", () => {
    expect(() => safePaypalUrl("https://evil.example/paypal.com")).toThrow();
    expect(() => safePaypalUrl("https://paypal.com.evil.example/x")).toThrow();
    expect(() => safePaypalUrl("https://notpaypal.com/x")).toThrow();
    expect(() => safePaypalUrl("http://www.paypal.com/x")).toThrow();
    expect(() => safePaypalUrl("javascript:alert(1)")).toThrow();
    expect(() => safePaypalUrl("not a url")).toThrow();
  });
});
