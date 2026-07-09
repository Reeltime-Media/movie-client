export function movieWatchHref(slug: string): string {
  return `/watch?slug=${encodeURIComponent(slug)}`;
}

export function moviePayHref(slug: string, title: string): string {
  return `/pay/movie?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`;
}

/** Poster / rail CTA: watch when free, owned, or admin; checkout when paid and not entitled. */
export function movieCardHref(
  movie: { slug: string; title: string; price_usd?: string | null },
  owned: boolean,
  isAdmin = false,
): string {
  const isFree = !movie.price_usd || parseFloat(movie.price_usd) === 0;
  if (isFree || owned || isAdmin) return movieWatchHref(movie.slug);
  return moviePayHref(movie.slug, movie.title);
}
