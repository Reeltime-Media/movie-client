"use client";

import { type ReactNode } from "react";
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
import { buildHomeGenreRails, moviesGenreHref } from "@/lib/home-genre-rails";
import { genreKeyFromLabel } from "@/lib/catalog-filter";
import type {
  GenreRailRead,
  HomeSectionPublic,
  PromotionBannerRead,
  HeroFeaturedSlide,
} from "@/lib/api/catalog";
import type { ContentListItemRead, SeriesRead, TvChannelRead } from "@/lib/api/types";
import type { PosterCardProps } from "@/types/poster-card";

type HomeSectionsFeedProps = {
  sections: HomeSectionPublic[];
  movies: ContentListItemRead[];
  seriesList: SeriesRead[];
  fallbackTvChannels: TvChannelRead[];
  fallbackHero: HeroFeaturedSlide[];
  fallbackBanners: PromotionBannerRead[];
  /** Legacy rails used when a CMS section has no curated items yet. */
  fallbackFreeToday: PosterCardProps[];
  fallbackComingSoon: PosterCardProps[];
  fallbackGenreRails?: GenreRailRead[];
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
  fallbackFreeToday,
  fallbackComingSoon,
  fallbackGenreRails = [],
  ownedIds,
  isAdmin,
  hasSubscription,
  loggedIn,
  continuePosters,
  libraryPosters,
  isEntitled,
}: HomeSectionsFeedProps) {
  const { t } = useI18n();

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

  const nodes: ReactNode[] = [];
  let genreHeaderAdded = false;
  let continueInjected = false;
  const curatedGenreLabels = new Set<string>();

  const renderContinue = (): ReactNode => {
    if (!loggedIn || continuePosters.length === 0 || continueInjected) return null;
    continueInjected = true;
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
      const posters =
        section.movies.length > 0 ? freePosters(section.movies) : fallbackFreeToday;
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
      const posters =
        section.movies.length > 0 ? soonPosters(section.movies) : fallbackComingSoon;
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
      if (section.type === "genre" && !genreHeaderAdded) {
        genreHeaderAdded = true;
        nodes.push(
          <section key="browse-by-genre" className="px-4 pt-10 pb-2 sm:px-6 md:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {t("homeBrowseByGenre")}
            </p>
          </section>,
        );
      }
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
      if (section.type === "genre" && section.genre_name) {
        curatedGenreLabels.add(section.genre_name.trim().toLowerCase());
      }
    }
  }

  // Fill remaining popular genres (same cap as before) when CMS only curated some.
  const autoGenreRails = buildHomeGenreRails(
    movies,
    ownedIds,
    isAdmin,
    hasSubscription,
  ).filter((rail) => !curatedGenreLabels.has(rail.label.trim().toLowerCase()));
  const curatedFromLegacy = fallbackGenreRails
    .filter((rail) => !curatedGenreLabels.has(rail.genre.trim().toLowerCase()))
    .map((rail) => ({
      label: rail.genre,
      posters: moviePosters(rail.movies),
    }));
  const extraGenreRails = [
    ...curatedFromLegacy,
    ...autoGenreRails.filter(
      (rail) =>
        !curatedFromLegacy.some(
          (r) => r.label.trim().toLowerCase() === rail.label.trim().toLowerCase(),
        ),
    ),
  ];
  if (extraGenreRails.length > 0) {
    if (!genreHeaderAdded) {
      nodes.push(
        <section key="browse-by-genre" className="px-4 pt-10 pb-2 sm:px-6 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {t("homeBrowseByGenre")}
          </p>
        </section>,
      );
    }
    for (const rail of extraGenreRails) {
      if (rail.posters.length === 0) continue;
      const knownKey = genreKeyFromLabel(rail.label);
      const railTitle = knownKey !== "genreAll" ? t(knownKey) : rail.label;
      nodes.push(
        <section key={`auto-genre-${rail.label}`} className="pt-4 pb-6">
          <SectionHeader
            title={railTitle}
            showSeeAll
            seeAllHref={moviesGenreHref(rail.label)}
            seeAllLabel={t("sectionSeeAll")}
          />
          <PosterScrollRail posters={rail.posters} gutter="sm" />
        </section>,
      );
    }
  }

  if (!continueInjected) {
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
