"use client";

import { useEffect, useState } from "react";
import { PosterCard } from "@/components/catalog/PosterCard";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WatchDetailBody } from "@/components/watch/WatchPageSection";
import { getRelatedMovies } from "@/lib/api/movies";
import { getRelatedSeries, listSeriesPage } from "@/lib/api/series";
import { listPurchases } from "@/lib/api/purchases";
import { listMySubscriptions, hasActiveSubscription } from "@/lib/api/subscriptions";
import { movieToPoster, seriesToPoster } from "@/lib/api/mappers";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import { swallow } from "@/lib/log";
import type { PosterCardProps } from "@/types/poster-card";

/** Defer discovery rails so they do not compete with watch page / player requests. */
const DEFER_MS = 1500;

type WatchDiscoveryRailsProps = {
  movieSlug?: string;
  seriesSlug?: string;
  genres?: string[];
  /** "grid" renders the series-picks section as a static poster grid titled "You may also like" instead of a scroll rail. */
  seriesPicksLayout?: "rail" | "grid";
};

export function WatchDiscoveryRails({
  movieSlug,
  seriesSlug,
  genres = [],
  seriesPicksLayout = "rail",
}: WatchDiscoveryRailsProps) {
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

    const purchasesPromise = listPurchases().catch(swallow("watch rails: load purchases", []));
    const subsPromise = loggedIn
      ? listMySubscriptions().catch(swallow("watch rails: load subscriptions", []))
      : Promise.resolve([]);

    if (movieSlug) {
      Promise.all([getRelatedMovies(movieSlug, 8), purchasesPromise])
        .then(([movies, purchases]) => {
          const ownedIds = new Set(purchases.map((p) => p.content_id));
          const posters = movies.map((m, i) => movieToPoster(m, i, ownedIds, isAdmin));
          setMoreLikeThis(posters);
          setTrending([...posters].reverse());
        })
        .catch(() => {});
    }

    const seriesPromise = seriesSlug
      ? getRelatedSeries(seriesSlug, 8)
      : genres[0]
        ? listSeriesPage({ genre: genres[0] }, 8)
        : Promise.resolve([]);

    Promise.all([seriesPromise, subsPromise])
      .then(([series, subs]) => {
        const hasSub = hasActiveSubscription(subs);
        setSeriesPicks(series.map((s, i) => seriesToPoster(s, i, { hasSubscription: hasSub, isAdmin })));
      })
      .catch(() => {});
  }, [enabled, loggedIn, isAdmin, movieSlug, seriesSlug, genres]);

  if (!enabled) return null;

  return (
    <>
      {moreLikeThis.length > 0 ? (
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
      ) : null}

      {trending.length > 0 ? (
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
      ) : null}

      {seriesPicks.length > 0 ? (
        <section className="pb-12">
          {seriesPicksLayout === "grid" ? (
            <>
              <SectionHeader title={t("watchYouMayAlsoLike")} />
              <WatchDetailBody>
                <div className="mx-auto mt-4 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
                  {seriesPicks.map((poster) => (
                    <PosterCard key={poster.watchHref ?? poster.titleBelow} {...poster} />
                  ))}
                </div>
              </WatchDetailBody>
            </>
          ) : (
            <WatchDetailBody>
              <SectionHeader
                title={t("watchSeriesPicks")}
                showSeeAll
                seeAllHref="/series"
                seeAllLabel={t("sectionSeeAll")}
              />
              <PosterScrollRail posters={seriesPicks} />
            </WatchDetailBody>
          )}
        </section>
      ) : null}
    </>
  );
}
