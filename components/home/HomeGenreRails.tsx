"use client";

import { useMemo } from "react";

import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { genreKeyFromLabel } from "@/lib/catalog-filter";
import { buildHomeGenreRails, moviesGenreHref } from "@/lib/home-genre-rails";
import type { ContentListItemRead } from "@/lib/api/types";

type HomeGenreRailsProps = {
  movies: ContentListItemRead[];
  ownedIds: Set<string>;
  isAdmin: boolean;
};

export function HomeGenreRails({ movies, ownedIds, isAdmin }: HomeGenreRailsProps) {
  const { t } = useI18n();

  const rails = useMemo(
    () => buildHomeGenreRails(movies, ownedIds, isAdmin),
    [movies, ownedIds, isAdmin],
  );

  if (rails.length === 0) return null;

  return (
    <>
      <section className="px-4 pt-10 pb-2 sm:px-6 md:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {t("homeBrowseByGenre")}
        </p>
      </section>

      {rails.map((rail) => {
        const knownKey = genreKeyFromLabel(rail.label);
        const title = knownKey !== "genreAll" ? t(knownKey) : rail.label;

        return (
          <section key={rail.label} className="pt-4 pb-6">
            <SectionHeader
              title={title}
              showSeeAll
              seeAllHref={moviesGenreHref(rail.label)}
              seeAllLabel={t("sectionSeeAll")}
            />
            <PosterScrollRail posters={rail.posters} gutter="sm" />
          </section>
        );
      })}
    </>
  );
}
