"use client";

import { useMemo, useRef } from "react";

import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { genreKeyFromLabel } from "@/lib/catalog-filter";
import { buildHomeGenreRails, moviesGenreHref } from "@/lib/home-genre-rails";
import type { ContentListItemRead } from "@/lib/api/types";
import type { PosterCardProps } from "@/types/poster-card";

type HomeGenreRailsProps = {
  movies: ContentListItemRead[];
  ownedIds: Set<string>;
  isAdmin: boolean;
};

function GenreRail({
  label,
  title,
  posters,
  seeAllLabel,
}: {
  label: string;
  title: string;
  posters: PosterCardProps[];
  seeAllLabel: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  return (
    <section className="pt-4 pb-6">
      <SectionHeader
        title={title}
        showSeeAll
        seeAllHref={moviesGenreHref(label)}
        seeAllLabel={seeAllLabel}
        scrollRef={railRef}
      />
      <PosterScrollRail posters={posters} gutter="sm" scrollRef={railRef} />
    </section>
  );
}

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
          <GenreRail
            key={rail.label}
            label={rail.label}
            title={title}
            posters={rail.posters}
            seeAllLabel={t("sectionSeeAll")}
          />
        );
      })}
    </>
  );
}
