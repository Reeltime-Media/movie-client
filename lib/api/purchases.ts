import { apiFetch } from "./client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "./client-cache";
import { listMovies } from "./movies";
import type { ContentListItemRead, PurchaseRead } from "./types";

export function listPurchases(): Promise<PurchaseRead[]> {
  return clientCached("user:purchases", CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<PurchaseRead[]>("/purchases/"),
  );
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
