"use client";

import { useEffect, useState } from "react";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WatchDetailBody } from "@/components/watch/WatchPageSection";
import { listMovies } from "@/lib/api/movies";
import { listSeries } from "@/lib/api/series";
import { movieToPoster, seriesToPoster } from "@/lib/api/to-poster";
import type { PosterCardProps } from "@/types/poster-card";

/** Defer discovery rails so they do not compete with watch page / player requests. */
const DEFER_MS = 1500;

export function WatchDiscoveryRails() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [moreLikeThis, setMoreLikeThis] = useState<PosterCardProps[]>([]);
  const [trending, setTrending] = useState<PosterCardProps[]>([]);
  const [seriesPicks, setSeriesPicks] = useState<PosterCardProps[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(true), DEFER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    listMovies()
      .then((movies) => {
        const posters = movies.map((m, i) => movieToPoster(m, i));
        setMoreLikeThis(posters.slice(0, 8));
        setTrending([...posters].reverse().slice(0, 8));
      })
      .catch(() => {});

    listSeries()
      .then((series) => {
        // Skip per-series episode fetches here — saves N API round-trips on watch page.
        setSeriesPicks(series.map((s, i) => seriesToPoster(s, i, { hasSubscription: false })));
      })
      .catch(() => {});
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <section className="pb-8 pt-8">
        <WatchDetailBody>
          <SectionHeader
            title={t("watchMoreLikeThis")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={moreLikeThis} />
        </WatchDetailBody>
      </section>

      <section className="pb-8">
        <WatchDetailBody>
          <SectionHeader
            title={t("moviesTrendingTitle")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={trending} />
        </WatchDetailBody>
      </section>

      <section className="pb-12">
        <WatchDetailBody>
          <SectionHeader
            title={t("watchSeriesPicks")}
            showSeeAll
            seeAllHref="/series"
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={seriesPicks} />
        </WatchDetailBody>
      </section>
    </>
  );
}
