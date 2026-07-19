export function movieWatchHref(slug: string): string {
  return `/watch?slug=${encodeURIComponent(slug)}`;
}

/**
 * Marker href for unpaid movies. Flip cards detect this and open the Bakong
 * modal instead of navigating. Visiting the URL redirects to `/watch`.
 */
export function moviePayHref(slug: string, title: string): string {
  return `/pay/movie?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
}

export function isMoviePayHref(href: string): boolean {
  return href.startsWith("/pay/movie");
}

/** Pull `slug` from a `/pay/movie?slug=…` href (relative or absolute). */
export function movieSlugFromPayHref(href: string): string | null {
  try {
    return new URL(href, "http://local.invalid").searchParams.get("slug");
  } catch {
    return null;
  }
}

/** Poster / rail CTA: watch when free, owned, or admin; pay-marker when paid and not entitled. */
export function movieCardHref(
  movie: { slug: string; title: string; price_usd?: string | null },
  owned: boolean,
  isAdmin = false,
): string {
  const isFree = !movie.price_usd || parseFloat(movie.price_usd) === 0;
  if (isFree || owned || isAdmin) return movieWatchHref(movie.slug);
  return moviePayHref(movie.slug, movie.title);
}
