import type { SeasonRead, WatchProgressRead } from "@/lib/api/types";

function normalizeContentId(id: string): string {
  return id.trim().toLowerCase();
}

export function contentIdsMatch(a: string, b: string): boolean {
  return normalizeContentId(a) === normalizeContentId(b);
}

function collectEpisodeIds(seasons: SeasonRead[]): Set<string> {
  const ids = new Set<string>();
  for (const season of seasons) {
    for (const ep of season.episodes) {
      ids.add(normalizeContentId(ep.id));
    }
  }
  return ids;
}

function progressRowQualifies(row: WatchProgressRead): boolean {
  if (row.completed) return true;
  return row.position_seconds > 0;
}

export function mergeProgressRow(
  rows: WatchProgressRead[],
  row: WatchProgressRead,
): WatchProgressRead[] {
  const next = rows.filter((r) => !contentIdsMatch(r.content_id, row.content_id));
  return [...next, row];
}

/** Map a progress row to the episode id used in the current season catalog. */
function mapProgressRowToEpisodeId(
  row: WatchProgressRead,
  seasons: SeasonRead[],
): string | null {
  for (const season of seasons) {
    for (const ep of season.episodes) {
      if (contentIdsMatch(ep.id, row.content_id)) return ep.id;
    }
  }
  const meta = row.content;
  if (meta?.season_number != null && meta?.episode_number != null) {
    for (const season of seasons) {
      if (season.season_number !== meta.season_number) continue;
      for (const ep of season.episodes) {
        if (ep.episode_number === meta.episode_number) return ep.id;
      }
    }
  }
  return null;
}

function rowBelongsToSeries(
  row: WatchProgressRead,
  seasons: SeasonRead[],
  seriesSlug?: string,
): boolean {
  if (mapProgressRowToEpisodeId(row, seasons)) return true;
  const episodeIds = collectEpisodeIds(seasons);
  if (episodeIds.has(normalizeContentId(row.content_id))) return true;
  if (seriesSlug && row.content?.series?.slug === seriesSlug) return true;
  return false;
}

/** Most recent episode in this series the viewer watched (sidebar “last watched”). */
export function pickLastWatchedEpisodeId(
  progress: WatchProgressRead[],
  seasons: SeasonRead[],
  options?: {
    /** Current episode resume from getWatchProgress when list API is stale. */
    boostEpisodeId?: string | null;
    boostPositionSeconds?: number | null;
    seriesSlug?: string;
  },
): string | null {
  const episodeIds = collectEpisodeIds(seasons);
  let best: { row: WatchProgressRead; episodeId: string } | null = null;

  for (const row of progress) {
    if (!rowBelongsToSeries(row, seasons, options?.seriesSlug)) continue;
    const episodeId = mapProgressRowToEpisodeId(row, seasons) ?? row.content_id;
    if (!episodeIds.has(normalizeContentId(episodeId))) continue;
    if (!progressRowQualifies(row)) continue;
    if (!best) {
      best = { row, episodeId };
      continue;
    }
    if (row.last_watched_at > best.row.last_watched_at) {
      best = { row, episodeId };
    }
  }

  const result = best?.episodeId ?? null;

  const boostId = options?.boostEpisodeId;
  const boostPos = options?.boostPositionSeconds ?? 0;
  const boostRowEarly = boostId
    ? progress.find((row) => contentIdsMatch(row.content_id, boostId))
    : undefined;
  const boostApplies =
    boostPos > 0 || boostRowEarly?.completed === true;
  if (boostId && boostApplies && episodeIds.has(normalizeContentId(boostId))) {
    if (!result) return boostId;
    if (contentIdsMatch(result, boostId)) return result;
    const boostRow = progress.find((row) => contentIdsMatch(row.content_id, boostId));
    if (!boostRow) return boostId;
    if (progressRowQualifies(boostRow) && boostRow.last_watched_at >= best!.row.last_watched_at) {
      return mapProgressRowToEpisodeId(boostRow, seasons) ?? boostRow.content_id;
    }
  }

  return result;
}

export function episodeWatchFractions(
  progress: WatchProgressRead[],
  seasons: SeasonRead[],
  seriesSlug?: string,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const row of progress) {
    if (!rowBelongsToSeries(row, seasons, seriesSlug)) continue;
    const episodeId = mapProgressRowToEpisodeId(row, seasons);
    if (!episodeId || !progressRowQualifies(row)) continue;
    let epDuration = row.content?.duration_seconds ?? null;
    if (epDuration == null) {
      for (const season of seasons) {
        for (const ep of season.episodes) {
          if (contentIdsMatch(ep.id, episodeId)) {
            epDuration = ep.duration_seconds;
            break;
          }
        }
      }
    }
    if (row.completed) {
      out.set(episodeId, 1);
    } else if (epDuration != null && epDuration > 0) {
      out.set(episodeId, Math.min(1, row.position_seconds / epDuration));
    } else if (row.position_seconds > 0) {
      out.set(episodeId, 0.12);
    }
  }
  return out;
}

export function findEpisodeByContentId(
  seasons: SeasonRead[],
  contentId: string,
): { seasonNumber: number; episodeNumber: number } | null {
  for (const season of seasons) {
    for (const ep of season.episodes) {
      if (contentIdsMatch(ep.id, contentId)) {
        return {
          seasonNumber: season.season_number,
          episodeNumber: ep.episode_number ?? 1,
        };
      }
    }
  }
  return null;
}
