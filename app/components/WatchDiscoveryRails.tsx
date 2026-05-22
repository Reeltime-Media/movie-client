"use client";

import { useEffect, useState } from "react";
import { PosterScrollRail } from "./PosterScrollRail";
import { SectionHeader } from "./SectionHeader";
import { useI18n } from "./LocaleProvider";
import { listMovies } from "@/lib/api/movies";
import { listSeries } from "@/lib/api/series";
import { mapSeriesListToPosters } from "@/lib/api/series-posters";
import { movieToPoster } from "@/lib/api/to-poster";
import type { PosterCardProps } from "./PosterCard";

export function WatchDiscoveryRails() {
  const { t } = useI18n();
  const [moreLikeThis, setMoreLikeThis] = useState<PosterCardProps[]>([]);
  const [trending, setTrending] = useState<PosterCardProps[]>([]);
  const [seriesPicks, setSeriesPicks] = useState<PosterCardProps[]>([]);

  useEffect(() => {
    listMovies()
      .then((movies) => {
        const posters = movies.map((m, i) => movieToPoster(m, i));
        setMoreLikeThis(posters.slice(0, 8));
        setTrending([...posters].reverse().slice(0, 8));
      })
      .catch(() => {});

    listSeries()
      .then(async (series) => {
        setSeriesPicks(await mapSeriesListToPosters(series, false));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="pb-8 pt-8">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("watchMoreLikeThis")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={moreLikeThis} />
      </section>

      <section className="pb-8">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("moviesTrendingTitle")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={trending} />
      </section>

      <section className="pb-12">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("watchSeriesPicks")}
            showSeeAll
            seeAllHref="/series"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={seriesPicks} />
      </section>
    </>
  );
}
