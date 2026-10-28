"use client";

import { useRef, type ReactNode } from "react";
import type { BannerCardProps } from "@/components/catalog/BannerCard";
import { BannerScrollRail } from "@/components/catalog/BannerScrollRail";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { Hero } from "@/components/home/Hero";
import { HomePlansSection } from "@/components/home/HomePlansSection";
import { PromotionBannerStrip } from "@/components/home/PromotionBannerStrip";
import { useI18n } from "@/components/providers/LocaleProvider";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TvChannelRail } from "@/components/tv/TvChannelRail";
import { movieToBanner, movieToPoster, seriesToBanner } from "@/lib/api/mappers";
import { moviesGenreHref } from "@/lib/home-genre-rails";
import { genreKeyFromLabel } from "@/lib/catalog-filter";
import type { HomeSectionPublic, PromotionBannerRead, HeroFeaturedSlide } from "@/lib/api/catalog";
import type { ContentListItemRead, SeriesRead, TvChannelRead } from "@/lib/api/types";
import type { PosterCardProps } from "@/types/poster-card";

type HomeSectionsFeedProps = {
  sections: HomeSectionPublic[];
  movies: ContentListItemRead[];
  seriesList: SeriesRead[];
  fallbackTvChannels: TvChannelRead[];
  fallbackHero: HeroFeaturedSlide[];
  fallbackBanners: PromotionBannerRead[];
  ownedIds: Set<string>;
  isAdmin: boolean;
  hasSubscription: boolean;
  loggedIn: boolean;
  continuePosters: PosterCardProps[];
  libraryPosters: PosterCardProps[];
  isEntitled: (channel: TvChannelRead) => boolean;
};

const RAIL_LIMIT = 12;
const RECENT_LIMIT = 10;

export function HomeSectionsFeed({
  sections,
  movies,
  seriesList,
  fallbackTvChannels,
  fallbackHero,
  fallbackBanners,
  ownedIds,
  isAdmin,
  hasSubscription,
  loggedIn,
  continuePosters,
  libraryPosters,
  isEntitled,
}: HomeSectionsFeedProps) {
  const { t } = useI18n();
  const continueInjected = useRef(false);
  continueInjected.current = false;

  const defaultTitle = (section: HomeSectionPublic): string => {
    if (section.title?.trim()) return section.title.trim();
    switch (section.type) {
      case "free_today":
        return t("homeFreeTodayTitle");
      case "trending":
        return t("moviesTrendingTitle");
      case "most_watched":
        return t("homeMostWatchedTitle");
      case "coming_soon":
        return t("homeComingSoonTitle");
      case "series":
        return t("seriesSubscribeTitle");
      case "genre": {
        if (!section.genre_name) return "Genre";
        const knownKey = genreKeyFromLabel(section.genre_name);
        return knownKey !== "genreAll" ? t(knownKey) : section.genre_name;
      }
      case "tv":
        return t("homeTvChannelsTitle");
      default:
        return section.type;
    }
  };

  const freePosters = (rows: ContentListItemRead[]): PosterCardProps[] =>
    rows.slice(0, RAIL_LIMIT).map((m, i) => ({
      ...movieToPoster(m, i, ownedIds, isAdmin, hasSubscription),
      badge: { kind: "free", label: "FREE" } as const,
      entitlement: { kind: "none" } as const,
      watchHref: `/watch?slug=${m.slug}`,
    }));

  const soonPosters = (rows: ContentListItemRead[]): PosterCardProps[] =>
    rows.slice(0, RAIL_LIMIT).map((m, i) => ({
      ...movieToPoster(m, i, ownedIds, isAdmin, hasSubscription),
      badge: { kind: "soon", label: "SOON" } as const,
      entitlement: { kind: "none" } as const,
      watchHref: "#",
    }));

  const moviePosters = (rows: ContentListItemRead[]): PosterCardProps[] =>
    rows
      .slice(0, RAIL_LIMIT)
      .map((m, i) => movieToPoster(m, i, ownedIds, isAdmin, hasSubscription));

  const fallbackTrending = (): PosterCardProps[] =>
    movies
      .slice(RECENT_LIMIT, RECENT_LIMIT + RAIL_LIMIT)
      .map((m, i) => movieToPoster(m, i, ownedIds, isAdmin, hasSubscription));

  const fallbackMostWatched = (): BannerCardProps[] =>
    movies
      .slice(0, RECENT_LIMIT)
      .map((m) => movieToBanner(m, ownedIds, isAdmin, hasSubscription));

  const fallbackSeries = (): BannerCardProps[] =>
    seriesList.slice(0, RAIL_LIMIT).map((s) => seriesToBanner(s));

  const renderContinue = () => {
    if (!loggedIn || continuePosters.length === 0 || continueInjected.current) return null;
    continueInjected.current = true;
    return (
      <section className="pt-8 pb-6" key="continue-watching">
        <SectionHeader
          title={t("homeContinueWatching")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}
        />
        <PosterScrollRail posters={continuePosters} gutter="sm" />
      </section>
    );
  };

  const nodes: ReactNode[] = [];

  for (const section of sections) {
    const title = defaultTitle(section);

    if (section.type === "hero") {
      nodes.push(
        <div
          key={section.id}
          className="rt-page-fade-in hidden md:block"
          style={{ ["--rt-enter-delay" as string]: "0ms" }}
        >
          <Hero
            featuredSlides={
              section.hero_slides.length > 0 ? section.hero_slides : fallbackHero
            }
            fallbackMovies={movies}
            fallbackSeries={seriesList}
          />
        </div>,
      );
      continue;
    }

    if (section.type === "tv") {
      const channels =
        section.channels.length > 0 ? section.channels : fallbackTvChannels;
      if (channels.length === 0) continue;
      nodes.push(
        <ScrollReveal key={section.id} as="section" className="pt-8 pb-6">
          <SectionHeader title={title} />
          <TvChannelRail channels={channels} isEntitled={isEntitled} />
        </ScrollReveal>,
      );
      continue;
    }

    if (section.type === "free_today") {
      const posters = freePosters(section.movies);
      if (posters.length === 0) continue;
      nodes.push(
        <ScrollReveal key={section.id} as="section" className="pt-8 pb-6">
          <SectionHeader title={title} />
          <PosterScrollRail posters={posters} gutter="sm" />
        </ScrollReveal>,
      );
      continue;
    }

    if (section.type === "most_watched") {
      const cards: BannerCardProps[] =
        section.movies.length > 0
          ? section.movies
              .slice(0, RECENT_LIMIT)
              .map((m) => movieToBanner(m, ownedIds, isAdmin, hasSubscription))
          : fallbackMostWatched();
      if (cards.length === 0) continue;
      nodes.push(
        <ScrollReveal key={section.id} as="section" className="pt-8 pb-6">
          <SectionHeader
            title={title}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
          <BannerScrollRail cards={cards} autoScroll direction="left" />
        </ScrollReveal>,
      );
      continue;
    }

    if (section.type === "plans") {
      nodes.push(
        <ScrollReveal key={section.id}>
          <HomePlansSection />
        </ScrollReveal>,
      );
      continue;
    }

    if (section.type === "coming_soon") {
      const posters = soonPosters(section.movies);
      if (posters.length === 0) continue;
      nodes.push(
        <ScrollReveal key={section.id} as="section" className="pt-8 pb-6">
          <SectionHeader title={title} />
          <PosterScrollRail posters={posters} gutter="sm" />
        </ScrollReveal>,
      );
      continue;
    }

    if (section.type === "trending") {
      const posters =
        section.movies.length > 0 ? moviePosters(section.movies) : fallbackTrending();
      if (posters.length === 0) continue;
      nodes.push(
        <section key={section.id} className="pt-8 pb-6">
          <SectionHeader
            title={title}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={posters} gutter="sm" />
        </section>,
      );
      continue;
    }

    if (section.type === "series") {
      const cards: BannerCardProps[] =
        section.series.length > 0
          ? section.series.map((s) => seriesToBanner(s as SeriesRead))
          : fallbackSeries();
      if (cards.length === 0) continue;
      nodes.push(
        <section key={section.id} className="pt-8 pb-6">
          <SectionHeader
            title={title}
            showSeeAll
            seeAllHref="/series"
            seeAllLabel={t("sectionSeeAll")}
          />
          <BannerScrollRail cards={cards} />
        </section>,
      );
      continue;
    }

    if (section.type === "banners") {
      const banners =
        section.banners.length > 0
          ? section.banners
          : fallbackBanners.length > 0
            ? fallbackBanners
            : [
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
                } satisfies PromotionBannerRead,
              ];
      nodes.push(
        <section key={section.id} className="pt-4 pb-2">
          <PromotionBannerStrip banners={banners} />
        </section>,
      );
      nodes.push(renderContinue());
      continue;
    }

    if (section.type === "genre" || section.type === "custom") {
      const posters = moviePosters(section.movies);
      const seriesCards =
        section.series.length > 0
          ? section.series.map((s) => seriesToBanner(s as SeriesRead))
          : [];
      if (posters.length === 0 && seriesCards.length === 0) continue;
      nodes.push(
        <section key={section.id} className="pt-4 pb-6">
          <SectionHeader
            title={title}
            showSeeAll={section.type === "genre"}
            seeAllHref={
              section.type === "genre" && section.genre_name
                ? moviesGenreHref(section.genre_name)
                : undefined
            }
            seeAllLabel={t("sectionSeeAll")}
          />
          {posters.length > 0 ? (
            <PosterScrollRail posters={posters} gutter="sm" />
          ) : null}
          {seriesCards.length > 0 ? <BannerScrollRail cards={seriesCards} /> : null}
        </section>,
      );
    }
  }

  if (!continueInjected.current) {
    nodes.push(renderContinue());
  }

  if (libraryPosters.length > 0) {
    nodes.push(
      <section key="library" className="pt-8 pb-12">
        <SectionHeader
          title={t("homeLibrarySpotlight")}
          showSeeAll
          seeAllHref="/my-library"
          seeAllLabel={t("sectionSeeAll")}
        />
        <PosterScrollRail posters={libraryPosters} gutter="sm" />
      </section>,
    );
  }

  return <>{nodes}</>;
}
