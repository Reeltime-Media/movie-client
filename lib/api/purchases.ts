import { apiFetch } from "./client";
import { invalidateClientCache } from "./client-cache";
import { listMovies } from "./movies";
import type { ContentListItemRead, PurchaseRead } from "./types";

const PURCHASES_CACHE_KEY = "user:purchases";

/** Fresh every time — entitlement must not lag behind a just-completed payment. */
export function listPurchases(): Promise<PurchaseRead[]> {
  return apiFetch<PurchaseRead[]>("/purchases/");
}

/** Clear any legacy cache key after checkout (safe no-op if unused). */
export function invalidatePurchasesCache(): void {
  invalidateClientCache(PURCHASES_CACHE_KEY);
}

/** Movies the signed-in user has purchased. */
export async function listOwnedMovies(): Promise<ContentListItemRead[]> {
  try {
    return await apiFetch<ContentListItemRead[]>("/library/owned");
  } catch {
    const [purchases, movies] = await Promise.all([
      listPurchases().catch(() => [] as PurchaseRead[]),
      listMovies().catch(() => [] as ContentListItemRead[]),
    ]);
    const ids = new Set(purchases.map((p) => String(p.content_id)));
    return movies.filter((m) => ids.has(String(m.id)));
  }
}
