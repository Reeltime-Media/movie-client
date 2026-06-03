import { fetchAllPages } from "./pagination";
import { apiFetch, catalogCache } from "./client";
import type { SeasonRead, SeriesRead } from "./types";
import type { CatalogListParams } from "./movies";

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
  return fetchAllPages<SeriesRead>(seriesListPath(params), 100, catalogCache);
}

export async function getSeries(slug: string): Promise<SeriesRead> {
  return apiFetch<SeriesRead>(`/series/${slug}`, catalogCache);
}

export async function listEpisodes(slug: string): Promise<SeasonRead[]> {
  return apiFetch<SeasonRead[]>(`/series/${slug}/episodes`, catalogCache);
}
