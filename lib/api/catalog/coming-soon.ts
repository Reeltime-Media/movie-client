import { apiFetch } from "../core/client";
import type { ContentListItemRead } from "../types";

/** Admin-curated picks — revalidate often so changes show up quickly. */
const comingSoonCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listComingSoon(
  init: RequestInit = comingSoonCache,
): Promise<ContentListItemRead[]> {
  return apiFetch<ContentListItemRead[]>("/coming-soon/", init);
}
