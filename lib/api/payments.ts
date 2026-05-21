import { apiFetch } from "./client";

export interface PaymentIntentRead {
  intent_id: string;
  order_id: string;
  user_id: string;
  kind: string;
  content_id: string | null;
  amount_usd: string;
  status: string;
  checkout_url: string;
  created_at: string;
  resolved_at: string | null;
}

export function createMoviePaymentIntent(
  contentId: string,
  customSuccessUrl?: string,
): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>(`/payments/movies/${contentId}/intent`, {
    method: "POST",
    body: { custom_success_url: customSuccessUrl ?? null },
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

export function completePaymentIntent(intentId: string): Promise<PaymentIntentRead> {
  return apiFetch<PaymentIntentRead>(`/payments/intents/${intentId}/complete`, {
    method: "POST",
  });
}
