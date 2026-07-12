"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
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
import { movieToBanner, movieToPoster, seriesToBanner } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import type { PosterCardProps } from "@/types/poster-card";
import type { HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { PromotionBannerRead } from "@/lib/api/promotion-banners";
import type { ContentListItemRead, SeasonRead, SeriesRead } from "@/lib/api/types";

type HomeViewProps = {
  movies: ContentListItemRead[];
  seriesList: SeriesRead[];
  seasons: SeasonRead[][];
  initialTrending: PosterCardProps[];
  initialSubscribe: PosterCardProps[];
  promotionBanners: PromotionBannerRead[];
  heroFeatured: HeroFeaturedSlide[];
};

const RAIL_LIMIT = 12;

export function HomeView({
  movies,
  seriesList,
  initialTrending,
  promotionBanners,
  heroFeatured,
}: HomeViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);

  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => new Set());

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

  const trendingPosters = moviePosters.length > 0 ? moviePosters : initialTrending.slice(0, RAIL_LIMIT);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    listPurchases()
      .catch(() => [])
      .then((purchases) => {
        if (cancelled) return;
        setOwnedIds(new Set(purchases.map((p) => p.content_id)));
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

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
      <div className="rt-page-fade-in" style={{ "--rt-enter-delay": "0ms" } as CSSProperties}>
        <Hero
          featuredSlides={heroFeatured}
          fallbackMovies={movies}
          fallbackSeries={seriesList}
        />
      </div>

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

        />
        <PosterScrollRail posters={moviePosters.length > 0 ? moviePosters : initialTrending.slice(0, RAIL_LIMIT)} gutter="sm" />
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

      <section className="pt-8 pb-6">
        <SectionHeader
          title={t("homeContinueWatching")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={trendingPosters} gutter="sm" />
      </section>

      <HomeGenreRails movies={movies} ownedIds={ownedIds} isAdmin={isAdmin} />

      <section className="pt-8 pb-6">
        <SectionHeader
          title={t("seriesPopularTitle")}
          showSeeAll
          seeAllHref="/series"
          seeAllLabel={t("sectionSeeAll")}
        />
        <BannerScrollRail cards={seriesBanners} />
      </section>

      <section className="pt-8 pb-12">
        <SectionHeader
          title={t("homeLibrarySpotlight")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={trendingPosters} gutter="sm" />
      </section>
    </PageShell>
  );
}
