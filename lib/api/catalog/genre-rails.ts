import { apiFetch } from "@/lib/api/client";
import type { ContentListItemRead } from "@/lib/api/types";

export type GenreRailRead = {
  genre: string;
  movies: ContentListItemRead[];
};

export async function listGenreRails(init?: RequestInit): Promise<GenreRailRead[]> {
  return apiFetch<GenreRailRead[]>("/genre-rails/", init);
}
