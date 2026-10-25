import type { PosterCardProps } from "@/types/poster-card";
import type { ContentListItemRead } from "@/lib/api/types";
import type { GenreRailRead } from "@/lib/api/catalog";
import { movieToPoster } from "@/lib/api/mappers";
import { collectGenreLabels, filterByGenreLabel } from "./catalog-filter";

export type HomeGenreRail = {
  /** Raw API genre label, e.g. "Action". */
  label: string;
  posters: PosterCardProps[];
};

const RAIL_LIMIT = 12;

/** Cap the home page to the most popular genres instead of one rail per genre in the catalog. */
const GENRE_RAIL_LIMIT = 6;

/** Build home poster rails for the most popular genres (by movie count) that actually appear on movies. */
function buildHomeGenreRails(
  movies: ContentListItemRead[],
  ownedIds: Set<string>,
  isAdmin: boolean,
  hasSubscription = false,
): HomeGenreRail[] {
  return collectGenreLabels(movies)
    .slice(0, GENRE_RAIL_LIMIT)
    .map((label) => {
      const posters = filterByGenreLabel(movies, label)
        .slice(0, RAIL_LIMIT)
        .map((movie, index) => movieToPoster(movie, index, ownedIds, isAdmin, hasSubscription));
      return { label, posters };
    })
    .filter((rail) => rail.posters.length > 0);
}

/**
 * Prefer admin-curated rails (order + picks). Fill remaining slots with automatic
 * rails for genres that were not curated, capped at GENRE_RAIL_LIMIT.
 */
export function resolveHomeGenreRails(
  curated: GenreRailRead[] | null | undefined,
  movies: ContentListItemRead[],
  ownedIds: Set<string>,
  isAdmin: boolean,
  hasSubscription = false,
): HomeGenreRail[] {
  const curatedRails = (curated ?? [])
    .map((rail) => ({
      label: rail.genre,
      posters: rail.movies
        .slice(0, RAIL_LIMIT)
        .map((movie, index) => movieToPoster(movie, index, ownedIds, isAdmin, hasSubscription)),
    }))
    .filter((rail) => rail.posters.length > 0);

  if (curatedRails.length === 0) {
    return buildHomeGenreRails(movies, ownedIds, isAdmin, hasSubscription);
  }

  const curatedLabels = new Set(curatedRails.map((rail) => rail.label.trim().toLowerCase()));
  const autoRails = buildHomeGenreRails(movies, ownedIds, isAdmin, hasSubscription).filter(
    (rail) => !curatedLabels.has(rail.label.trim().toLowerCase()),
  );

  return [...curatedRails, ...autoRails].slice(0, GENRE_RAIL_LIMIT);
}

export function moviesGenreHref(label: string): string {
  const trimmed = label.trim();
  return trimmed ? `/movies?genre=${encodeURIComponent(trimmed)}` : "/movies";
}
