import type { ContentListItemRead, ContentRead } from "@/lib/api/types";

export function isMovieFree(
  movie: Pick<ContentListItemRead, "price_usd" | "is_free">,
): boolean {
  if (movie.is_free) return true;
  return !movie.price_usd || parseFloat(movie.price_usd) === 0;
}

export function canWatchMovie(
  movie: Pick<ContentListItemRead, "id" | "price_usd" | "is_free">,
  options: {
    ownedIds?: Set<string>;
    isAdmin?: boolean;
  } = {},
): boolean {
  if (options.isAdmin) return true;
  if (isMovieFree(movie)) return true;
  return Boolean(options.ownedIds?.has(movie.id));
}
