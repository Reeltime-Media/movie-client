import { apiFetch } from "./client";
import type { SubscriptionPlanRead } from "./types";

export function listSubscriptionPlans(): Promise<SubscriptionPlanRead[]> {
  return apiFetch<SubscriptionPlanRead[]>("/subscriptions/plans");
}
