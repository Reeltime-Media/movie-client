"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BannerCardProps } from "@/components/catalog/BannerCard";
import { BannerScrollRail } from "@/components/catalog/BannerScrollRail";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { Hero } from "@/components/home/Hero";
import { HomeGenreRails } from "@/components/home/HomeGenreRails";
import { PromotionBannerStrip } from "@/components/home/PromotionBannerStrip";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { listPurchases } from "@/lib/api/purchases";
import { listWatchProgress } from "@/lib/api/playback";
import { movieToBanner, movieToPoster, seriesToBanner } from "@/lib/api/mappers";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import { swallow } from "@/lib/log";
import type { PosterCardProps } from "@/types/poster-card";
import type { HeroFeaturedSlide } from "@/lib/api/catalog";
import type { PromotionBannerRead } from "@/lib/api/catalog";
import type { ContentListItemRead, SeriesRead, WatchProgressRead } from "@/lib/api/types";

type HomeViewProps = {
  movies: ContentListItemRead[];
  seriesList: SeriesRead[];
  initialTrending: PosterCardProps[];
  initialFreeToday: PosterCardProps[];
  initialComingSoon: PosterCardProps[];
  promotionBanners: PromotionBannerRead[];
  heroFeatured: HeroFeaturedSlide[];
};

const RAIL_LIMIT = 12;

export function HomeView({
  movies,
  seriesList,
  initialTrending,
  initialFreeToday,
  initialComingSoon,
  promotionBanners,
  heroFeatured,
}: HomeViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);

  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set());
  const [continuePosters, setContinuePosters] = useState<PosterCardProps[]>([]);

  const freeTodayRailRef = useRef<HTMLDivElement>(null);
  const comingSoonRailRef = useRef<HTMLDivElement>(null);
  const trendingRailRef = useRef<HTMLDivElement>(null);
  const continueRailRef = useRef<HTMLDivElement>(null);
  const libraryRailRef = useRef<HTMLDivElement>(null);

  const movieById = useMemo(() => {
    const map = new Map<string, ContentListItemRead>();
    for (const movie of movies) map.set(movie.id, movie);
    return map;
  }, [movies]);

  const moviePosters = useMemo(
    () => movies.slice(0, RAIL_LIMIT).map((m, i) => movieToPoster(m, i, ownedIds, isAdmin)),
    [movies, ownedIds, isAdmin],
  );

  const seriesBanners = useMemo(
    () => seriesList.slice(0, RAIL_LIMIT).map((s) => seriesToBanner(s)),
    [seriesList],
  );

  const topMovieBanners = useMemo<BannerCardProps[]>(
    () => movies.slice(0, RAIL_LIMIT).map((m) => movieToBanner(m, ownedIds, isAdmin)),
    [movies, ownedIds, isAdmin],
  );

  const libraryPosters = useMemo(
    () =>
      movies
        .filter((m) => ownedIds.has(m.id))
        .slice(0, RAIL_LIMIT)
        .map((m, i) => movieToPoster(m, i, ownedIds, isAdmin)),
    [movies, ownedIds, isAdmin],
  );

  const trendingPosters = moviePosters.length > 0 ? moviePosters : initialTrending.slice(0, RAIL_LIMIT);

  useEffect(() => {
    let cancelled = false;
    listPurchases()
      .catch(swallow("home: load purchases", []))
      .then((purchases) => {
        if (cancelled) return;
        setOwnedIds(new Set(purchases.map((p) => p.content_id)));
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) {
      setContinuePosters([]);
      return;
    }
    let cancelled = false;
    listWatchProgress()
      .catch(swallow("home: load watch progress", [] as WatchProgressRead[]))
      .then((progress) => {
        if (cancelled) return;
        const posters: PosterCardProps[] = [];
        for (const row of progress) {
          if (posters.length >= RAIL_LIMIT) break;
          const movie = movieById.get(row.content_id);
          if (!movie) continue;
          posters.push(movieToPoster(movie, posters.length, ownedIds, isAdmin));
        }
        setContinuePosters(posters);
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, movieById, ownedIds, isAdmin]);

  const displayBanners = useMemo((): PromotionBannerRead[] => {
    if (promotionBanners.length > 0) return promotionBanners;
    return [
      {
        id: "reeltime-plus-fallback",
        title: t("homePlusTitle"),
        subtitle: t("homePlusDesc"),
        image_key: null,
        cta_label: t("homePlusCta"),
        cta_href: "/pricing",
        placement: "home",
        is_active: true,
        sort_order: 0,
        starts_at: null,
        ends_at: null,
        created_at: "",
        updated_at: "",
      },
    ];
  }, [promotionBanners, t]);

  return (
    <PageShell fullWidth footer>
      <div
        className="rt-page-fade-in hidden md:block"
        style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
      >
        <Hero
          featuredSlides={heroFeatured}
          fallbackMovies={movies}
          fallbackSeries={seriesList}
        />
      </div>

      {initialFreeToday.length > 0 && (
        <ScrollReveal as="section" className="pt-8 pb-6">
          <SectionHeader title={t("homeFreeTodayTitle")} scrollRef={freeTodayRailRef} />
          <PosterScrollRail posters={initialFreeToday} gutter="sm" scrollRef={freeTodayRailRef} />
        </ScrollReveal>
      )}

      {initialComingSoon.length > 0 && (
        <ScrollReveal as="section" className="pt-8 pb-6">
          <SectionHeader title={t("homeComingSoonTitle")} scrollRef={comingSoonRailRef} />
          <PosterScrollRail posters={initialComingSoon} gutter="sm" scrollRef={comingSoonRailRef} />
        </ScrollReveal>
      )}

      <ScrollReveal as="section" className="pt-8 pb-6">
        <SectionHeader title={t("homeMostWatchedTitle")} showSeeAll seeAllHref="/movies" seeAllLabel={t("sectionSeeAll")} />
        <BannerScrollRail cards={topMovieBanners} autoScroll direction="left" />
      </ScrollReveal>

      <section className="pt-8 pb-6">
        <SectionHeader
          title={t("moviesTrendingTitle")}
          showSeeAll
          seeAllHref="/movies"
          seeAllLabel={t("sectionSeeAll")}
          scrollRef={trendingRailRef}
        />
        <PosterScrollRail posters={trendingPosters} gutter="sm" scrollRef={trendingRailRef} />
      </section>

      <section className="pt-8 pb-6">
        <SectionHeader
          title={t("seriesSubscribeTitle")}
          showSeeAll
          seeAllHref="/series"
          seeAllLabel={t("sectionSeeAll")}
        />
        <BannerScrollRail cards={seriesBanners} />
      </section>

      <section className="pt-4 pb-2">
        <PromotionBannerStrip banners={displayBanners} />
      </section>

      {continuePosters.length > 0 ? (
        <section className="pt-8 pb-6">
          <SectionHeader
            title={t("homeContinueWatching")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
            scrollRef={continueRailRef}
          />
          <PosterScrollRail posters={continuePosters} gutter="sm" scrollRef={continueRailRef} />
        </section>
      ) : null}

      <HomeGenreRails movies={movies} ownedIds={ownedIds} isAdmin={isAdmin} />

      {libraryPosters.length > 0 ? (
        <section className="pt-8 pb-12">
          <SectionHeader
            title={t("homeLibrarySpotlight")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
            scrollRef={libraryRailRef}
          />
          <PosterScrollRail posters={libraryPosters} gutter="sm" scrollRef={libraryRailRef} />
        </section>
      ) : null}
    </PageShell>
  );
}
