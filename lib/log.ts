/**
 * Catch handler for best-effort fetches: returns the fallback so the UI keeps
 * working, but warns in development so a broken endpoint doesn't silently
 * look like "the user owns nothing".
 */
export function swallow<T>(context: string, fallback: T): (err: unknown) => T {
  return (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[reeltime] ${context} failed:`, err);
    }
    return fallback;
  };
}
