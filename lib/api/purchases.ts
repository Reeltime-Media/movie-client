import { apiFetch } from "./client";
import type { PurchaseRead } from "./types";

export function listPurchases(): Promise<PurchaseRead[]> {
  return apiFetch<PurchaseRead[]>("/purchases/");
}
