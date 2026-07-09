import { isMovieFree } from "@/lib/movie-entitlement";
import type { ContentListItemRead } from "@/lib/api/types";

export function movieWatchHref(slug: string): string {
  return `/watch?slug=${encodeURIComponent(slug)}`;
}

export function moviePayHref(slug: string, title: string): string {
  return `/pay/movie?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
}

/** Poster / rail CTA: watch when entitled; checkout when paid and known-not-owned. */
export function movieCardHref(
  movie: Pick<ContentListItemRead, "slug" | "title" | "price_usd" | "is_free">,
  owned: boolean,
  isAdmin = false,
  /** When true (logged in, purchases still loading), link to watch and let that page decide. */
  entitlementPending = false,
): string {
  if (isMovieFree(movie) || owned || isAdmin) return movieWatchHref(movie.slug);
  if (entitlementPending) return movieWatchHref(movie.slug);
  return moviePayHref(movie.slug, movie.title);
}
