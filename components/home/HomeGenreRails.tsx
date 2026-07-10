"use client";

import { useMemo } from "react";

import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { filterByGenre } from "@/lib/catalog-filter";
import { HOME_GENRE_RAILS, moviesGenreHref } from "@/lib/home-genre-rails";
import { movieToPoster } from "@/lib/api/to-poster";
import type { ContentListItemRead } from "@/lib/api/types";

const RAIL_LIMIT = 12;

type HomeGenreRailsProps = {
  movies: ContentListItemRead[];
  ownedIds: Set<string>;
  isAdmin: boolean;
};

export function HomeGenreRails({ movies, ownedIds, isAdmin }: HomeGenreRailsProps) {
  const { t } = useI18n();

  const rails = useMemo(
    () =>
      HOME_GENRE_RAILS.map((rail) => ({
        ...rail,
        posters: filterByGenre(movies, rail.genreKey)
          .slice(0, RAIL_LIMIT)
          .map((movie, index) => movieToPoster(movie, index, ownedIds, isAdmin)),
      })).filter((rail) => rail.posters.length > 0),
    [movies, ownedIds, isAdmin],
  );

  if (rails.length === 0) return null;

  return (
    <>
      <section className="px-4 pt-10 pb-2 sm:px-6 md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {t("homeBrowseByMood")}
        </p>
      </section>

      {rails.map((rail) => (
        <section key={rail.genreKey} className="pt-4 pb-6">
          <SectionHeader
            title={t(rail.titleKey)}
            showSeeAll
            seeAllHref={moviesGenreHref(rail.genreKey)}
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={rail.posters} gutter="sm" />
        </section>
      ))}
    </>
  );
}
