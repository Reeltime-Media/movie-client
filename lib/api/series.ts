import { apiFetch } from "./client";
import type { SeasonRead, SeriesRead } from "./types";

export async function listSeries(): Promise<SeriesRead[]> {
  return apiFetch<SeriesRead[]>("/series/");
}

export async function getSeries(slug: string): Promise<SeriesRead> {
  return apiFetch<SeriesRead>(`/series/${slug}`);
}

export async function listEpisodes(slug: string): Promise<SeasonRead[]> {
  return apiFetch<SeasonRead[]>(`/series/${slug}/episodes`);
}
