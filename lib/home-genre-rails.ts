import type { PosterCardProps } from "@/types/poster-card";
import type { ContentListItemRead } from "@/lib/api/types";
import { movieToPoster } from "@/lib/api/mappers";
import { collectGenreLabels, filterByGenreLabel } from "./catalog-filter";

export type HomeGenreRail = {
  /** Raw API genre label, e.g. "Action". */
  label: string;
  posters: PosterCardProps[];
};

const RAIL_LIMIT = 12;

/** Build home poster rails from genres that actually appear on movies. */
export function buildHomeGenreRails(
  movies: ContentListItemRead[],
  ownedIds: Set<string>,
  isAdmin: boolean,
): HomeGenreRail[] {
  return collectGenreLabels(movies)
    .map((label) => {
      const posters = filterByGenreLabel(movies, label)
        .slice(0, RAIL_LIMIT)
        .map((movie, index) => movieToPoster(movie, index, ownedIds, isAdmin));
      return { label, posters };
    })
    .filter((rail) => rail.posters.length > 0);
}

export function moviesGenreHref(label: string): string {
  const trimmed = label.trim();
  return trimmed ? `/movies?genre=${encodeURIComponent(trimmed)}` : "/movies";
}
