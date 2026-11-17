import { apiFetch } from "../core/client";

export interface PaymentIntentRead {
  intent_id: string;
  order_id: string;
  user_id: string | null;
  method: string;
  kind: string;
  content_id: string | null;
  amount_usd: string;
  status: string;
  /** Baray only — redirect target. Bakong intents poll in place, no redirect. */
  checkout_url: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface BakongPaymentIntentRead {
  intent_id: string;
  order_id: string;
  qr_string: string;
  amount_usd: string;
  status: string;
  created_at: string;
  merchant_name: string;
}

export interface CatalogPricingRead {
  series_unlock_usd: string;
  min_paid_usd: string;
  /** True once the API has PayPal credentials: only then show the PayPal button. */
  paypal_enabled?: boolean;
}

export interface PaypalIntentRead {
  intent_id: string;
  order_id: string;
  /** Send the buyer here (full-page redirect) to pay on PayPal. */
  approve_url: string;
  amount_usd: string;
  status: string;
  created_at: string;
}

/** "paypal" = PayPal login page. "card" = ask PayPal for its Visa/Mastercard page, for
 * buyers without a PayPal account (still paid on paypal.com; PayPal decides if it shows). */
export type PaypalFunding = "paypal" | "card";

export interface PaypalCheckoutOptions {
  /** Same-site path to open after payment (e.g. the movie's watch page). */
  returnPath?: string;
  funding?: PaypalFunding;
}

/** Flat catalog amounts charged by checkout — keep UI in sync with the API. */
export function getCatalogPricing(): Promise<CatalogPricingRead> {
  return apiFetch<CatalogPricingRead>("/payments/pricing");
}

/** Inline Bakong KHQR checkout — no redirect. Poll getPaymentIntent(intent_id)
 * for status; the server actively checks Bakong on each poll (no webhook). */
export function createMovieBakongIntent(contentId: string): Promise<BakongPaymentIntentRead> {
  return apiFetch<BakongPaymentIntentRead>(`/payments/movies/${contentId}/bakong-intent`, {
    method: "POST",
  });
}

function paypalBody(options: PaypalCheckoutOptions) {
  return {
    return_path: options.returnPath ?? null,
    client: "web",
    funding: options.funding ?? "paypal",
    // Come back to the origin the buyer started on (their login lives there).
    return_origin: typeof window !== "undefined" ? window.location.origin : null,
  };
}

/** PayPal checkout for one movie. Redirect the buyer to `approve_url`; PayPal returns them
 * to /pay/paypal/return, which captures the payment. */
export function createMoviePaypalIntent(
  contentId: string,
  options: PaypalCheckoutOptions = {},
): Promise<PaypalIntentRead> {
  return apiFetch<PaypalIntentRead>(`/payments/paypal/movies/${contentId}/intent`, {
    method: "POST",
    body: paypalBody(options),
  });
}

export function createSeriesUnlockPaypalIntent(
  seriesSlug: string,
  options: PaypalCheckoutOptions = {},
): Promise<PaypalIntentRead> {
  return apiFetch<PaypalIntentRead>(
    `/payments/paypal/series/${encodeURIComponent(seriesSlug)}/unlock-intent`,
    { method: "POST", body: paypalBody(options) },
  );
}

export function createSubscriptionPaypalIntent(
  planCode: string,
  options: PaypalCheckoutOptions = {},
): Promise<PaypalIntentRead> {
  const query = `?plan_code=${encodeURIComponent(planCode)}`;
  return apiFetch<PaypalIntentRead>(`/payments/paypal/subscription-intent${query}`, {
    method: "POST",
    body: paypalBody(options),
  });
}

/** Finish a payment the buyer approved on PayPal (the `token` PayPal adds to the return URL).
 * Safe to call twice: the second call just reports the same result. */
export function capturePaypalOrder(orderId: string): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>("/payments/paypal/capture", {
    method: "POST",
    body: { order_id: orderId },
  });
}

export function getPaymentIntent(intentId: string): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>(`/payments/intents/${intentId}`);
}

/** Inline Bakong KHQR checkout for a subscription plan — no redirect. Poll
 * getPaymentIntent(intent_id) for status, same as the movie flow. */
export function createSubscriptionBakongIntent(
  planCode: string,
): Promise<BakongPaymentIntentRead> {
  const query = `?plan_code=${encodeURIComponent(planCode)}`;
  return apiFetch<BakongPaymentIntentRead>(`/payments/subscription-bakong-intent${query}`, {
    method: "POST",
  });
}

/** Inline Bakong KHQR checkout for a one-time "unlock this series" purchase —
 * no redirect. Poll getPaymentIntent(intent_id) for status, same as the
 * movie flow. */
export function createSeriesUnlockBakongIntent(
  seriesSlug: string,
): Promise<BakongPaymentIntentRead> {
  return apiFetch<BakongPaymentIntentRead>(
    `/payments/series/${encodeURIComponent(seriesSlug)}/unlock-bakong-intent`,
    { method: "POST" },
  );
}

// BARAY DISABLED — subscription redirect checkout + success polling. Keep for later.
// export function createSeriesSubscriptionIntent(
//   seriesId: string,
//   customSuccessUrl?: string,
// ): Promise<PaymentIntentRead> {
//   return apiFetch<PaymentIntentRead>(`/payments/series/${seriesId}/subscription-intent`, {
//     method: "POST",
//     body: { custom_success_url: customSuccessUrl ?? null },
//   });
// }
//
// const POLL_MS = 1500;
// const MAX_POLL_ATTEMPTS = 40;
//
// // Wait for Baray webhook to mark the intent succeeded (no client-side fulfillment).
// export async function waitForPaymentSucceeded(intentId: string): Promise<PaymentIntentRead> {
//   for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
//     const intent = await getPaymentIntent(intentId);
//     if (intent.status === "succeeded") {
//       return intent;
//     }
//     if (intent.status === "failed" || intent.status === "cancelled") {
//       throw new Error("Payment was not completed.");
//     }
//     await new Promise((resolve) => setTimeout(resolve, POLL_MS));
//   }
//   throw new Error("Payment confirmation timed out. If you were charged, contact support.");
// }
