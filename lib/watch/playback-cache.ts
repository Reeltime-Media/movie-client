import { getPlaybackUrl } from "@/lib/api/playback";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export function getCachedPlaybackUrl(contentId: string): string | undefined {
  return cache.get(contentId);
}

export function setCachedPlaybackUrl(contentId: string, url: string): void {
  cache.set(contentId, url);
}

/** Best-effort warmup — dedupes concurrent requests for the same content. */
export function prefetchPlaybackUrl(contentId: string): Promise<string | null> {
  const hit = cache.get(contentId);
  if (hit) return Promise.resolve(hit);

  const pending = inflight.get(contentId);
  if (pending) return pending.catch(() => null);

  const p = getPlaybackUrl(contentId)
    .then((url) => {
      cache.set(contentId, url);
      inflight.delete(contentId);
      return url;
    })
    .catch((err) => {
      inflight.delete(contentId);
      throw err;
    });

  inflight.set(contentId, p);
  return p.catch(() => null);
}

/**
 * Resolve a playback URL, using the cache for instant paint when available.
 * Always refreshes the token in the background when a cached URL exists.
 */
export async function resolvePlaybackUrl(
  contentId: string,
  options?: { refresh?: boolean },
): Promise<string> {
  const cached = cache.get(contentId);
  if (cached && !options?.refresh) {
    void prefetchPlaybackUrl(contentId).catch(() => {
      /* background token refresh */
    });
    return cached;
  }

  const url = await getPlaybackUrl(contentId);
  cache.set(contentId, url);
  return url;
}
