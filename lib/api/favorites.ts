import { apiFetch } from "./client";

export type FavoriteRead = {
  content_id: string;
  created_at: string;
};

export function listFavorites(): Promise<FavoriteRead[]> {
  return apiFetch<FavoriteRead[]>("/favorites/");
}

export function addFavorite(contentId: string): Promise<FavoriteRead> {
  return apiFetch<FavoriteRead>(`/favorites/${contentId}`, { method: "PUT" });
}

export function removeFavorite(contentId: string): Promise<void> {
  return apiFetch<void>(`/favorites/${contentId}`, { method: "DELETE" });
}
