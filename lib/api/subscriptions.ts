import { apiFetch } from "./client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "./client-cache";
import type { SubscriptionRead } from "./types";

const SUBSCRIPTIONS_CACHE_KEY = "user:subscriptions";

export function listMySubscriptions(): Promise<SubscriptionRead[]> {
  return clientCached(SUBSCRIPTIONS_CACHE_KEY, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SubscriptionRead[]>("/subscriptions/me"),
  );
}
