import { resolveApiUrl } from "./resolve-api-url";

/** Resolved at call time so HTTPS clients use /api-proxy, not a build-time server URL. */
export function getApiUrl(): string {
  return resolveApiUrl();
}

const R2_PUBLIC_URL =
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

/**
 * How long (seconds) Server Components may cache the public catalog before
 * revalidating. The catalog changes rarely, so a few minutes is plenty and
 * makes navigation feel instant. No effect on client-side fetches.
 */
const CATALOG_REVALIDATE_SECONDS = 300;

/** Fetch init that enables Next.js catalog caching/ISR (server-side only). */
export const catalogCache: RequestInit = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS },
} as RequestInit;

export function posterUrl(posterKey: string | null | undefined): string | undefined {
  if (!posterKey) return undefined;
  if (/^https?:\/\//i.test(posterKey)) return posterKey;
  if (posterKey.startsWith("/")) return posterKey;
  if (!R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${posterKey.replace(/^\//, "")}`;
}

/**
 * Smaller poster URL for rail thumbnails.
 * Prefers generated `-w{width}.webp` sibling objects written on upload optimize.
 * Falls back to the full poster (CdnImage can also fall back on load error).
 */
export function posterThumbUrl(
  posterKey: string | null | undefined,
  width = 400,
): string | undefined {
  const base = posterUrl(posterKey);
  if (!base) return undefined;
  if (!isR2ImageUrl(base)) return base;

  // movies/x/poster.webp -> movies/x/poster-w400.webp
  const thumb = base.replace(/(\.[^.?#]+)(\?[^#]*)?(#.*)?$/, `-w${width}$1$2$3`);
  if (thumb !== base) return thumb;

  const param = process.env.NEXT_PUBLIC_R2_IMAGE_WIDTH_PARAM?.trim();
  if (!param) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${param}=${width}`;
}

/** True for poster/banner URLs served from our R2 public bucket. */
export function isR2ImageUrl(src: string): boolean {
  if (R2_PUBLIC_URL && src.startsWith(R2_PUBLIC_URL)) return true;
  return /\.r2\.dev\//.test(src);
}
