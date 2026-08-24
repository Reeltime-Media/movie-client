import { apiFetch } from "../core/client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "../core/client-cache";
import type { SubscriptionRead } from "../types";

const SUBSCRIPTIONS_CACHE_KEY = "user:subscriptions";

export function listMySubscriptions(): Promise<SubscriptionRead[]> {
  return clientCached(SUBSCRIPTIONS_CACHE_KEY, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SubscriptionRead[]>("/subscriptions/me"),
  );
}

/** Mirrors the server's `user_has_active_subscription` (content_access.py) —
 * `status` alone isn't enough since nothing flips it away from "active" when
 * a period lapses without renewal; the period end must still be in the future. */
export function isSubscriptionActive(sub: SubscriptionRead): boolean {
  return sub.status === "active" && new Date(sub.current_period_end).getTime() > Date.now();
}

export function hasActiveSubscription(subs: SubscriptionRead[]): boolean {
  return subs.some(isSubscriptionActive);
}
