import { apiFetch } from "./client";
import type { SubscriptionRead } from "./types";

export function listMySubscriptions(): Promise<SubscriptionRead[]> {
  return apiFetch<SubscriptionRead[]>("/subscriptions/me");
}
