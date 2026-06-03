"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "./Hero";
import { PromotionBannerStrip } from "./PromotionBannerStrip";
import { useI18n } from "./LocaleProvider";
import { PageShell } from "./PageShell";
import { PosterScrollRail } from "./PosterScrollRail";
import { ScrollReveal } from "./ScrollReveal";
import { SectionHeader } from "./SectionHeader";
import type { TranslationKey } from "@/lib/i18n";
import { listPurchases } from "@/lib/api/purchases";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { seriesToPoster, movieToPoster } from "@/lib/api/to-poster";
import { isLoggedIn } from "@/lib/api/client";
import type { PosterCardProps } from "@/app/components/PosterCard";
import type { HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { PromotionBannerRead } from "@/lib/api/promotion-banners";
import type { ContentListItemRead, SeasonRead, SeriesRead } from "@/lib/api/types";

const quickFilters: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "homeFilterKhmerPicks", href: "/movies" },
  { labelKey: "homeFilterNewReleases", href: "/movies" },
  { labelKey: "genreAction", href: "/movies" },
  { labelKey: "genreDrama", href: "/series" },
  { labelKey: "homeFilterThrillers", href: "/movies" },
  { labelKey: "homeFilterFamilyNight", href: "/series" },
];

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
  seasons,
  initialTrending,
  initialSubscribe,
  promotionBanners,
  heroFeatured,
}: HomeViewProps) {
  const { t } = useI18n();

  // Seeded from server-rendered posters so the first paint already has the
  // catalog — no client fetch waterfall. We only re-derive once we know the
  // signed-in user's entitlements (owned / subscribed).
  const [trendingPosters, setTrendingPosters] = useState<PosterCardProps[]>(initialTrending);
  const [subscribePosters, setSubscribePosters] = useState<PosterCardProps[]>(initialSubscribe);
  const [thrillerPosters, setThrillerPosters] = useState<PosterCardProps[]>(
    () => [...initialTrending].reverse(),
  );
  const [continuePosters, setContinuePosters] = useState<PosterCardProps[]>(
    () => initialTrending.slice(0, 6),
  );
  const [libraryPosters, setLibraryPosters] = useState<PosterCardProps[]>(
    () => initialTrending.slice(0, 8),
  );

  useEffect(() => {
    if (!isLoggedIn()) return;
    let cancelled = false;
    Promise.all([
      listPurchases().catch(() => []),
      listMySubscriptions().catch(() => []),
    ]).then(([purchases, subs]) => {
      if (cancelled) return;
      const ownedIds = new Set(purchases.map((p) => p.content_id));
      const hasSub = subs.some((s) => s.status === "active");
      if (movies.length) {
        const moviePosters = movies.map((m, i) => movieToPoster(m, i, ownedIds));
        setTrendingPosters(moviePosters);
        setThrillerPosters([...moviePosters].reverse());
        setLibraryPosters(moviePosters.slice(0, 8));
        setContinuePosters(moviePosters.slice(0, 6));
      }
      if (seriesList.length) {
        setSubscribePosters(
          seriesList.map((s, i) =>
            seriesToPoster(s, i, { hasSubscription: hasSub, seasons: seasons[i] ?? [] }),
          ),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [movies, seriesList, seasons]);

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
    <PageShell wide>
      <div className="rt-page-fade-in" style={{ "--rt-enter-delay": "0ms" } as CSSProperties}>
        <Hero
          featuredSlides={heroFeatured}
          fallbackMovies={movies}
          fallbackSeries={seriesList}
        />
      </div>

      <ScrollReveal as="section" variant="fade-in" className="px-6 pt-5 md:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {quickFilters.map((filter) => (
            <Link
              key={filter.labelKey}
              href={filter.href}
              className={[
                "shrink-0 cursor-pointer rounded-md border px-3 py-2 text-[12px] font-semibold transition-colors",
                filter.labelKey === "homeFilterKhmerPicks"
                  ? "border-brand bg-brand text-white hover:bg-brand-hover"
                  : "border-border bg-surface text-text-muted hover:border-border-hover hover:text-text",
              ].join(" ")}
            >
              {t(filter.labelKey)}
            </Link>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="pb-7 pt-5">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("moviesTrendingTitle")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={trendingPosters} imagePriorityCount={2} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pb-8 pt-3" delay={60}>
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("seriesSubscribeTitle")}
            showSeeAll
            seeAllHref="/series"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={subscribePosters} imagePriorityCount={2} />
      </ScrollReveal>

      <ScrollReveal as="div" variant="fade-up-scale" delay={40}>
        <PromotionBannerStrip banners={displayBanners} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pb-10 pt-1">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeContinueWatching")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={continuePosters} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pb-10 pt-3" delay={40}>
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeLateNightThrillers")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={thrillerPosters} />
      </ScrollReveal>

      <ScrollReveal as="section" className="pb-12 pt-3" delay={80}>
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeLibrarySpotlight")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={libraryPosters} />
      </ScrollReveal>
    </PageShell>
  );
}
