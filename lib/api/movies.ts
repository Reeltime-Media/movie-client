import { fetchAllPages } from "./pagination";
import { apiFetch, catalogCache } from "./client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "./client-cache";
import type { ContentListItemRead, ContentRead } from "./types";

export type CatalogListParams = {
  search?: string;
  genre?: string;
};

function moviesListPath(params?: CatalogListParams): string {
  const qs = new URLSearchParams();
  const search = params?.search?.trim();
  const genre = params?.genre?.trim();
  if (search) qs.set("search", search);
  if (genre) qs.set("genre", genre);
  const query = qs.toString();
  return query ? `/movies/?${query}` : "/movies/";
}

export async function listMovies(params?: CatalogListParams): Promise<ContentListItemRead[]> {
  const path = moviesListPath(params);
  return clientCached(`movies:list:${path}`, CLIENT_CATALOG_TTL_MS, () =>
    fetchAllPages<ContentListItemRead>(path, 100, catalogCache),
  );
}

export async function getMovie(slug: string): Promise<ContentRead> {
  return clientCached(`movies:${slug}`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<ContentRead>(`/movies/${slug}`, catalogCache),
  );
}
