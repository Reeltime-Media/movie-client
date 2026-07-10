import { apiFetch } from "./client";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

/**
 * Fetch every page from a paginated list endpoint (public catalog).
 *
 * `init` is forwarded to `fetch` — pass `{ next: { revalidate } }` from Server
 * Components to enable Next.js data caching/ISR for the public catalog.
 */
export async function fetchAllPages<T>(
  path: string,
  pageSize = 100,
  init?: RequestInit,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let pages = 1;
  const maxPages = 100;

  do {
    const q = path.includes("?") ? "&" : "?";
    const res = await apiFetch<PaginatedResponse<T>>(
      `${path}${q}page=${page}&page_size=${pageSize}`,
      init,
    );
    all.push(...res.items);
    pages = res.pages;
    page += 1;
  } while (page <= pages && page <= maxPages);

  return all;
}

/** Fetch a single page from a paginated list endpoint. */
export async function fetchPage<T>(
  path: string,
  page = 1,
  pageSize = 12,
  init?: RequestInit,
): Promise<T[]> {
  const q = path.includes("?") ? "&" : "?";
  const res = await apiFetch<PaginatedResponse<T>>(
    `${path}${q}page=${page}&page_size=${pageSize}`,
    init,
  );
  return res.items;
}
