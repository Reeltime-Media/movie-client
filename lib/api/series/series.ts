import { fetchAllPages, fetchPage } from "../core/pagination";
import { apiFetch, catalogCache } from "../core/client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "../core/client-cache";
import type { SeasonRead, SeriesRead } from "../types";
import type { CatalogListParams } from "../movies";

function seriesListPath(params?: CatalogListParams): string {
  const qs = new URLSearchParams();
  const search = params?.search?.trim();
  const genre = params?.genre?.trim();
  if (search) qs.set("search", search);
  if (genre) qs.set("genre", genre);
  const query = qs.toString();
  return query ? `/series/?${query}` : "/series/";
}

export async function listSeries(params?: CatalogListParams): Promise<SeriesRead[]> {
  const path = seriesListPath(params);
  return clientCached(`series:list:${path}`, CLIENT_CATALOG_TTL_MS, () =>
    fetchAllPages<SeriesRead>(path, 100, catalogCache),
  );
}

export async function listSeriesPage(
  params?: CatalogListParams,
  limit = 8,
): Promise<SeriesRead[]> {
  const path = seriesListPath(params);
  return clientCached(`series:page:${path}:${limit}`, CLIENT_CATALOG_TTL_MS, () =>
    fetchPage<SeriesRead>(path, 1, limit, catalogCache),
  );
}

export async function getSeries(slug: string): Promise<SeriesRead> {
  return clientCached(`series:${slug}`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SeriesRead>(`/series/${slug}`, catalogCache),
  );
}

export async function listEpisodes(slug: string): Promise<SeasonRead[]> {
  return clientCached(`series:${slug}:episodes`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SeasonRead[]>(`/series/${slug}/episodes`, catalogCache),
  );
}

export async function getRelatedSeries(
  slug: string,
  limit = 8,
): Promise<SeriesRead[]> {
  return clientCached(`series:${slug}:related:${limit}`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<SeriesRead[]>(`/series/${slug}/related?limit=${limit}`, catalogCache),
  );
}
