import { apiFetch } from "../core/client";
import { clientCached, CLIENT_CATALOG_TTL_MS, invalidateClientCache } from "../core/client-cache";
import type { SubscriptionPlanRead, SubscriptionRead } from "../types";

const SUBSCRIPTIONS_CACHE_KEY = "user:subscriptions";
const SUBSCRIPTION_PLANS_CACHE_KEY = "catalog:subscription-plans";

export function listMySubscriptions(): Promise<SubscriptionRead[]> {
  return clientCached(SUBSCRIPTIONS_CACHE_KEY, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SubscriptionRead[]>("/subscriptions/me"),
  );
}

/** Active plans as configured by the admin — the source of truth for which
 * price/code a checkout should actually charge. Public, no auth required. */
export function listSubscriptionPlans(): Promise<SubscriptionPlanRead[]> {
  return clientCached(SUBSCRIPTION_PLANS_CACHE_KEY, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SubscriptionPlanRead[]>("/subscriptions/plans"),
  );
}

/** Clear the cached subscription list after checkout so entitlement checks
 * (e.g. `hasSubscription` gates) see the just-completed payment immediately. */
export function invalidateSubscriptionsCache(): void {
  invalidateClientCache(SUBSCRIPTIONS_CACHE_KEY);
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
