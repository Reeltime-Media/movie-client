"use client";

import { useEffect, useState } from "react";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WatchDetailBody } from "@/components/watch/WatchPageSection";
import { listMovies } from "@/lib/api/movies";
import { listSeries } from "@/lib/api/series";
import { listPurchases } from "@/lib/api/purchases";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { movieToPoster, seriesToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import type { PosterCardProps } from "@/types/poster-card";

/** Defer discovery rails so they do not compete with watch page / player requests. */
const DEFER_MS = 1500;

export function WatchDiscoveryRails() {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
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

    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);
    const subsPromise = loggedIn ? listMySubscriptions().catch(() => []) : Promise.resolve([]);

    Promise.all([listMovies(), purchasesPromise])
      .then(([movies, purchases]) => {
        const ownedIds = new Set(purchases.map(p => p.content_id));
        const posters = movies.map((m, i) => movieToPoster(m, i, ownedIds, isAdmin));
        setMoreLikeThis(posters.slice(0, 8));
        setTrending([...posters].reverse().slice(0, 8));
      })
      .catch(() => {});

    Promise.all([listSeries(), subsPromise])
      .then(([series, subs]) => {
        const hasSub = subs.some((s) => s.status === "active");
        setSeriesPicks(series.map((s, i) => seriesToPoster(s, i, { hasSubscription: hasSub, isAdmin })));
      })
      .catch(() => {});
  }, [enabled, loggedIn, isAdmin]);

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
