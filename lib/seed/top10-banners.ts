/**
 * Banner images for the "Top 10 Movies of the Week" cards.
 *
 * The catalog list endpoint (`ContentListItemRead`) only returns `poster_key`,
 * not `banner_key`, so the Top 10 cards have no banner of their own. We fall
 * back to a shared default banner served from `public/sample_images/`.
 *
 * To give a specific movie its own banner, map its `slug` to an image path in
 * `bySlug`; anything not listed uses `DEFAULT_BANNER`.
 */

/** Default banner used for any movie that has no banner of its own. */
export const DEFAULT_BANNER = "/sample_images/banner2.png";

/** Optional per-movie banner overrides, keyed by movie slug. */
const bySlug: Record<string, string> = {
  // "example-movie-slug": "/sample_images/example-movie-slug.png",
};

/** Resolve the banner image path for a given movie slug (default if none). */
export function seedBannerSrc(slug: string): string {
  return bySlug[slug] ?? DEFAULT_BANNER;
}
