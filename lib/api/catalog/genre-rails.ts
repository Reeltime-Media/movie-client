import { apiFetch } from "../core/client";
import type { ContentListItemRead } from "../types";

export type GenreRailRead = {
  genre: string;
  movies: ContentListItemRead[];
};

/** Admin-curated home rails — revalidate often so reorder shows up quickly. */
const genreRailsCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listGenreRails(
  init: RequestInit = genreRailsCache,
): Promise<GenreRailRead[]> {
  return apiFetch<GenreRailRead[]>("/genre-rails/", init);
}
