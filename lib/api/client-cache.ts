type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Default TTL for public catalog data — matches the server-side revalidate window. */
export const CLIENT_CATALOG_TTL_MS = 300_000;

/**
 * Client-only in-memory cache with in-flight request de-duplication.
 *
 * On the server this is a passthrough — Next.js's `fetch` cache (via
 * `catalogCache`) already handles caching/ISR there, and a module-level Map
 * would leak across requests. On the client it makes repeated navigations to
 * the same catalog data instant and collapses concurrent callers (e.g. the hero
 * and a rail both asking for `listMovies`) into a single network request.
 */
export function clientCached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") return fn();

  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return Promise.resolve(hit.value);

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const p = fn()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, p);
  return p;
}

/** Drop a cached entry (e.g. after a mutation invalidates catalog data). */
export function invalidateClientCache(key: string): void {
  store.delete(key);
  inflight.delete(key);
}
