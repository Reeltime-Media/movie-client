import { safeRedirectPath } from "@/lib/safe-redirect";

export type PaypalReturn = {
  /** PayPal's order id (the `token` PayPal appends). Null if missing or malformed. */
  orderId: string | null;
  intentId: string | null;
  /** Same-site path to open after payment (validated). */
  next: string;
  /** "app" = the buyer came from the mobile app's in-app browser. */
  client: "web" | "app";
  cancelled: boolean;
};

const ORDER_ID = /^[A-Za-z0-9_-]{5,64}$/;

export function parsePaypalReturn(params: URLSearchParams): PaypalReturn {
  const token = params.get("token")?.trim() ?? "";
  return {
    orderId: ORDER_ID.test(token) ? token : null,
    intentId: params.get("intent")?.trim() || null,
    next: safeRedirectPath(params.get("next"), "/"),
    client: params.get("client") === "app" ? "app" : "web",
    cancelled: params.get("cancelled") === "1",
  };
}
