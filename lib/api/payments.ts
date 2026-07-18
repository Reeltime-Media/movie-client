import { apiFetch } from "./client";

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

/** Inline Bakong KHQR checkout — no redirect. Poll getPaymentIntent(intent_id)
 * for status; the server actively checks Bakong on each poll (no webhook). */
export function createMovieBakongIntent(contentId: string): Promise<BakongPaymentIntentRead> {
  return apiFetch<BakongPaymentIntentRead>(`/payments/movies/${contentId}/bakong-intent`, {
    method: "POST",
  });
}

export function createSeriesSubscriptionIntent(
  seriesId: string,
  customSuccessUrl?: string,
): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>(`/payments/series/${seriesId}/subscription-intent`, {
    method: "POST",
    body: { custom_success_url: customSuccessUrl ?? null },
  });
}

export function getPaymentIntent(intentId: string): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>(`/payments/intents/${intentId}`);
}

const POLL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

/** Wait for Baray webhook to mark the intent succeeded (no client-side fulfillment). */
export async function waitForPaymentSucceeded(intentId: string): Promise<PaymentIntentRead> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const intent = await getPaymentIntent(intentId);
    if (intent.status === "succeeded") {
      return intent;
    }
    if (intent.status === "failed" || intent.status === "cancelled") {
      throw new Error("Payment was not completed.");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error("Payment confirmation timed out. If you were charged, contact support.");
}
