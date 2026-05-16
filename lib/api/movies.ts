import { apiFetch } from "./client";
import type { ContentRead } from "./types";

export async function listMovies(): Promise<ContentRead[]> {
  return apiFetch<ContentRead[]>("/movies/");
}

export async function getMovie(slug: string): Promise<ContentRead> {
  return apiFetch<ContentRead>(`/movies/${slug}`);
}
