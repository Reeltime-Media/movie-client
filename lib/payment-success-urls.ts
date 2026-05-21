const DEFAULT_ORIGIN = "http://localhost:3000";
export const PENDING_INTENT_KEY = "rt_pending_intent_id";

/** Public site origin sent to Baray as `custom_success_url` (must be absolute). */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_ORIGIN;
}

export function moviePaymentSuccessUrl(movieSlug: string): string {
  const next = `/watch?slug=${encodeURIComponent(movieSlug)}`;
  return `${getAppOrigin()}/payment/success?next=${encodeURIComponent(next)}`;
}

export function seriesSubscriptionSuccessUrl(
  seriesSlug: string,
  opts?: { season?: string | null; episode?: string | null },
): string {
  const season = parseEpisodePart(opts?.season) ?? 1;
  const episode = parseEpisodePart(opts?.episode) ?? 1;
  const next = `/watch/series/${seriesSlug}/${season}/${episode}`;
  return `${getAppOrigin()}/payment/success?next=${encodeURIComponent(next)}`;
}

function parseEpisodePart(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
