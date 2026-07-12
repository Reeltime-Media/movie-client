/** Build /pricing URL for series unlock / subscribe flows. */
export function seriesPricingHref(opts?: {
  slug?: string | null;
  season?: number | string | null;
  episode?: number | string | null;
  title?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts?.slug) params.set("slug", opts.slug);
  if (opts?.season != null && opts.season !== "") {
    params.set("season", String(opts.season));
  }
  if (opts?.episode != null && opts.episode !== "") {
    params.set("episode", String(opts.episode));
  }
  if (opts?.title) params.set("title", opts.title);
  const q = params.toString();
  return q ? `/pricing?${q}` : "/pricing";
}
