const PREFIX = "rt_series_last_watched:";

function key(seriesIdOrSlug: string): string {
  return `${PREFIX}${seriesIdOrSlug.trim().toLowerCase()}`;
}

/** Browser cursor so the episode grid can mark last watched without waiting on API. */
export function getSeriesLastWatchedCursor(seriesIdOrSlug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(key(seriesIdOrSlug));
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function setSeriesLastWatchedCursor(
  seriesIdOrSlug: string,
  episodeId: string,
): void {
  if (typeof window === "undefined") return;
  const id = seriesIdOrSlug.trim();
  const ep = episodeId.trim();
  if (!id || !ep) return;
  try {
    localStorage.setItem(key(id), ep);
  } catch {
    /* private mode / quota — ignore */
  }
}
