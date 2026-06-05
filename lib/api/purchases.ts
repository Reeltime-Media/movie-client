import { apiFetch } from "./client";
import { listMovies } from "./movies";
import type { ContentListItemRead, PurchaseRead } from "./types";

export function listPurchases(): Promise<PurchaseRead[]> {
  return apiFetch<PurchaseRead[]>("/purchases/");
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
