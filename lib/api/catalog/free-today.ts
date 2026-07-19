import { apiFetch } from "../core/client";
import type { ContentListItemRead } from "../types";

/** Admin-curated picks — revalidate often so changes show up quickly. */
const freeTodayCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listFreeToday(
  init: RequestInit = freeTodayCache,
): Promise<ContentListItemRead[]> {
  return apiFetch<ContentListItemRead[]>("/free-today/", init);
}
