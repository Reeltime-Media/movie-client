"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import type { BannerCardProps } from "@/components/catalog/BannerCard";
import { BannerScrollRail } from "@/components/catalog/BannerScrollRail";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { Hero } from "@/components/home/Hero";
import { PromotionBannerStrip } from "@/components/home/PromotionBannerStrip";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { listPurchases } from "@/lib/api/purchases";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { movieToPoster, seriesToBanner } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
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

export function HomeView({
  movies,
  seriesList,
  initialTrending,
  promotionBanners,
  heroFeatured,
}: HomeViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();

  const RAIL_LIMIT = 12;

  const [trendingPosters, setTrendingPosters] = useState<PosterCardProps[]>(() => initialTrending.slice(0, RAIL_LIMIT));
  const [seriesBanners, setSeriesBanners] = useState<BannerCardProps[]>(
    () => seriesList.slice(0, RAIL_LIMIT).map((s) => seriesToBanner(s)),
  );
  const [thrillerPosters, setThrillerPosters] = useState<PosterCardProps[]>(
    () => [...initialTrending].reverse().slice(0, RAIL_LIMIT),
  );
  const [continuePosters, setContinuePosters] = useState<PosterCardProps[]>(
    () => initialTrending.slice(0, RAIL_LIMIT),
  );
  const [libraryPosters, setLibraryPosters] = useState<PosterCardProps[]>(
    () => initialTrending.slice(0, RAIL_LIMIT),
  );

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    Promise.all([
      listPurchases().catch(() => []),
      listMySubscriptions().catch(() => []),
    ]).then(([purchases]) => {
      if (cancelled) return;
      const ownedIds = new Set(purchases.map((p) => p.content_id));
      if (movies.length) {
        const moviePosters = movies.map((m, i) => movieToPoster(m, i, ownedIds)).slice(0, RAIL_LIMIT);
        setTrendingPosters(moviePosters);
        setThrillerPosters([...moviePosters].reverse());
        setLibraryPosters(moviePosters);
        setContinuePosters(moviePosters);
      }
      if (seriesList.length) {
        setSeriesBanners(seriesList.slice(0, RAIL_LIMIT).map((s) => seriesToBanner(s)));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, movies, seriesList]);

  const displayBanners = useMemo((): PromotionBannerRead[] => {
    if (promotionBanners.length > 0) return promotionBanners;
    return [
      {
        id: "reeltime-plus-fallback",
        title: t("homePlusTitle"),
        subtitle: t("homePlusDesc"),
        image_key: null,
        cta_label: t("homePlusCta"),
        cta_href: "/pay/subscription?title=Reeltime%20Plus",
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
        <SectionHeader
          title={t("moviesTrendingTitle")}
          showSeeAll
          seeAllHref="/movies"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={trendingPosters} gutter="sm" autoScroll direction="left" />
      </ScrollReveal>

      <ScrollReveal as="section" className="pt-8 pb-6" delay={60}>
        <SectionHeader
          title={t("seriesSubscribeTitle")}
          showSeeAll
          seeAllHref="/series"
          seeAllLabel={t("sectionSeeAll")}

        />
        <BannerScrollRail cards={seriesBanners} autoScroll direction="right" />
      </ScrollReveal>

      <ScrollReveal as="div" variant="fade-up-scale" delay={40} className="pt-4 pb-2">
        <PromotionBannerStrip banners={displayBanners} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pt-8 pb-6">
        <SectionHeader
          title={t("homeContinueWatching")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={continuePosters} gutter="sm" autoScroll direction="left" speed={0.5} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pt-8 pb-6" delay={40}>
        <SectionHeader
          title={t("homeLateNightThrillers")}
          showSeeAll
          seeAllHref="/movies"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={thrillerPosters} gutter="sm" autoScroll direction="right" speed={0.7} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pt-8 pb-12" delay={80}>
        <SectionHeader
          title={t("homeLibrarySpotlight")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}

        />
        <PosterScrollRail posters={libraryPosters} gutter="sm" autoScroll direction="left" speed={0.55} />
      </ScrollReveal>
    </PageShell>
  );
}
