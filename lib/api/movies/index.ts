import { fetchAllPages, fetchPage } from "../core/pagination";
import { apiFetch, catalogCache } from "../core/client";
import { clientCached, CLIENT_CATALOG_TTL_MS } from "../core/client-cache";
import type { ComingSoonItemRead, ContentListItemRead, ContentRead } from "../types";

/** Admin-curated, changes should show up quickly. */
const comingSoonCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listComingSoon(
  init: RequestInit = comingSoonCache,
): Promise<ComingSoonItemRead[]> {
  return apiFetch<ComingSoonItemRead[]>("/movies/coming-soon", init);
}

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

/** Single-page movie list — prefer this for home rails instead of draining all pages. */
export async function listMoviesPage(
  params?: CatalogListParams,
  limit = 12,
): Promise<ContentListItemRead[]> {
  const path = moviesListPath(params);
  return clientCached(`movies:page:${path}:${limit}`, CLIENT_CATALOG_TTL_MS, () =>
    fetchPage<ContentListItemRead>(path, 1, limit, catalogCache),
  );
}

export async function getMovie(slug: string): Promise<ContentRead> {
  return clientCached(`movies:${slug}`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<ContentRead>(`/movies/${slug}`, catalogCache),
  );
}

export async function getRelatedMovies(
  slug: string,
  limit = 8,
): Promise<ContentListItemRead[]> {
  return clientCached(`movies:${slug}:related:${limit}`, CLIENT_CATALOG_TTL_MS, () =>
    apiFetch<ContentListItemRead[]>(`/movies/${slug}/related?limit=${limit}`, catalogCache),
  );
}
