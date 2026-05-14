"use client";

import { PosterScrollRail } from "./PosterScrollRail";
import { SectionHeader } from "./SectionHeader";
import { useI18n } from "./LocaleProvider";
import {
  watchMoreLikeThisPosters,
  watchSeriesPicksPosters,
  watchTrendingPosters,
} from "../mock/posters";

export function WatchDiscoveryRails() {
  const { t } = useI18n();

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
        <PosterScrollRail posters={watchMoreLikeThisPosters} />
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
        <PosterScrollRail posters={watchTrendingPosters} />
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
        <PosterScrollRail posters={watchSeriesPicksPosters} />
      </section>
    </>
  );
}
