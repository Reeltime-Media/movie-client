/**
 * Fallback banner images for pay-page Top 10 cards when a movie has no
 * `banner_key`. Map a slug in `bySlug` for a custom override; otherwise
 * `DEFAULT_BANNER` is used.
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
