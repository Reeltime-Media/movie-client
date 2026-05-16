"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clapperboard,
  Crown,
  Flame,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Hero } from "./components/Hero";
import { CinematicDecor } from "./components/CinematicDecor";
import { useI18n } from "./components/LocaleProvider";
import { PageShell } from "./components/PageShell";
import { PosterScrollRail } from "./components/PosterScrollRail";
import { SectionHeader } from "./components/SectionHeader";
import type { TranslationKey } from "@/lib/i18n";
import { marketingImages } from "@/lib/marketing-images";
import {
  homeContinueWatchingPosters,
  homeLateNightThrillersPosters,
  homeLibrarySpotlightPosters,
  homeSubscribeRailPosters,
  homeTrendingPosters,
} from "./mock/posters";
import { listMovies } from "@/lib/api/movies";
import { listSeries } from "@/lib/api/series";
import { movieToPoster, seriesToPoster } from "@/lib/api/to-poster";
import type { PosterCardProps } from "@/app/components/PosterCard";

const editorialCollections: {
  titleKey: TranslationKey;
  eyebrowKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
  icon: typeof Sparkles;
  accent: string;
}[] = [
  {
    titleKey: "homeEd1Title",
    eyebrowKey: "homeEd1Eyebrow",
    descKey: "homeEd1Desc",
    href: "/movies",
    icon: Sparkles,
    accent: "bg-brand",
  },
  {
    titleKey: "homeEd2Title",
    eyebrowKey: "homeEd2Eyebrow",
    descKey: "homeEd2Desc",
    href: "/movies",
    icon: Clapperboard,
    accent: "bg-warning",
  },
  {
    titleKey: "homeEd3Title",
    eyebrowKey: "homeEd3Eyebrow",
    descKey: "homeEd3Desc",
    href: "/series",
    icon: Crown,
    accent: "bg-success",
  },
];

const platformStats: { value: string; labelKey: TranslationKey }[] = [
  { value: "1,200+", labelKey: "homeStatLabelMoviesSeries" },
  { value: "4K", labelKey: "homeStatLabelSelectedTitles" },
  { value: "24/7", labelKey: "homeStatLabelWatchAnywhere" },
];

const quickFilters: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "homeFilterKhmerPicks", href: "/movies" },
  { labelKey: "homeFilterNewReleases", href: "/movies" },
  { labelKey: "genreAction", href: "/movies" },
  { labelKey: "genreDrama", href: "/series" },
  { labelKey: "homeFilterThrillers", href: "/movies" },
  { labelKey: "homeFilterFamilyNight", href: "/series" },
];

export default function Home() {
  const { t } = useI18n();

  const [trendingPosters, setTrendingPosters] = useState<PosterCardProps[]>(homeTrendingPosters);
  const [subscribePosters, setSubscribePosters] = useState<PosterCardProps[]>(homeSubscribeRailPosters);
  const [continuePosters, setContinuePosters] = useState<PosterCardProps[]>(homeContinueWatchingPosters);
  const [thrillerPosters, setThrillerPosters] = useState<PosterCardProps[]>(homeLateNightThrillersPosters);
  const [libraryPosters, setLibraryPosters] = useState<PosterCardProps[]>(homeLibrarySpotlightPosters);

  useEffect(() => {
    Promise.all([listMovies(), listSeries()]).then(([movies, seriesList]) => {
      if (movies.length) {
        const moviePosters = movies.map((m, i) => movieToPoster(m, i));
        setTrendingPosters(moviePosters);
        setThrillerPosters([...moviePosters].reverse());
        setLibraryPosters(moviePosters.slice(0, 8));
        setContinuePosters(moviePosters.slice(0, 6));
      }
      if (seriesList.length) {
        setSubscribePosters(seriesList.map((s, i) => seriesToPoster(s, i)));
      }
    }).catch(() => {
      // not logged in or API unavailable — keep mock data
    });
  }, []);

  return (
    <PageShell wide>
      <div className="rt-page-fade-in" style={{ "--rt-enter-delay": "0ms" } as CSSProperties}>
        <Hero />
      </div>

      <section className="px-6 pt-4 md:px-8">
        <div className="overflow-hidden rounded-sm border border-border shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          <CinematicDecor
            imageSrc={marketingImages.theaterSeats}
            imageDescription="Dimly lit movie theater with rows of red seats"
            showBrandGlow
            minHeightClass="min-h-[200px] sm:min-h-[240px] md:min-h-[280px]"
          >
            <div className="flex max-w-2xl flex-col gap-3 md:max-w-xl">
              <p
                className="rt-page-fade-up text-[11px] font-bold uppercase tracking-[0.14em] text-white/85"
                style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
              >
                {t("homeDecorKicker")}
              </p>
              <h2
                className="rt-page-fade-up text-balance text-[clamp(1.375rem,3.2vw,1.875rem)] font-extrabold leading-[1.1] tracking-tight text-white"
                style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
              >
                {t("homeDecorTitle")}
              </h2>
              <p
                className="rt-page-fade-up max-w-lg text-[13px] leading-relaxed text-white/75"
                style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
              >
                {t("homeDecorDesc")}
              </p>
              <Link
                href="/movies"
                className="rt-page-fade-up mt-2 inline-flex w-max cursor-pointer items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
                style={{ "--rt-enter-delay": "165ms" } as CSSProperties}
              >
                {t("homeDecorCta")}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </CinematicDecor>
        </div>
      </section>

      <section
        className="rt-page-fade-up px-6 pt-7 md:px-8"
        style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-5 rounded-sm border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
              <Flame size={13} aria-hidden />
              {t("homeNowStreaming")}
            </div>
            <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-text">
              {t("homeFindNextWatch")}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
              {t("homeFindNextWatchDesc")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
            {platformStats.map((stat) => (
              <div key={stat.labelKey} className="rounded-sm border border-border bg-bg px-3 py-3">
                <div className="text-[18px] font-black tracking-[-0.02em] text-text">{stat.value}</div>
                <div className="mt-1 text-[10px] font-medium leading-tight text-text-muted">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="rt-page-fade-in px-6 pt-5 md:px-8"
        style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
      >
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
      </section>

      <section
        className="rt-page-fade-up px-6 pb-4 pt-7 md:px-8"
        style={{ "--rt-enter-delay": "280ms" } as CSSProperties}
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {t("homeCuratedKicker")}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] text-text">
              {t("homeBrowseByMood")}
            </h2>
          </div>
          <Link
            href="/movies"
            className="group hidden cursor-pointer items-center gap-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text sm:inline-flex"
          >
            {t("homeExploreMovies")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {editorialCollections.map((collection, i) => {
            const Icon = collection.icon;
            return (
              <Link
                key={collection.titleKey}
                href={collection.href}
                className="rt-page-fade-up group cursor-pointer rounded-sm border border-border bg-surface p-4 transition-colors hover:border-border-hover hover:bg-surface-elevated"
                style={{ "--rt-enter-delay": `${320 + i * 55}ms` } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-sm ${collection.accent} text-white`}
                  >
                    <Icon size={17} aria-hidden />
                  </div>
                  <ArrowRight
                    size={15}
                    className="mt-1 text-text-disabled transition-all group-hover:translate-x-0.5 group-hover:text-text-muted"
                    aria-hidden
                  />
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  {t(collection.eyebrowKey)}
                </p>
                <h3 className="mt-1 text-[17px] font-extrabold tracking-[-0.01em] text-text">
                  {t(collection.titleKey)}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
                  {t(collection.descKey)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="rt-page-fade-up pb-7 pt-5"
        style={{ "--rt-enter-delay": "420ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("moviesTrendingTitle")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={trendingPosters} imagePriorityCount={2} />
      </section>

      <section
        className="rt-page-fade-up pb-8 pt-3"
        style={{ "--rt-enter-delay": "480ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("seriesSubscribeTitle")}
            showSeeAll
            seeAllHref="/series"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={subscribePosters} imagePriorityCount={2} />
      </section>

      <section className="px-6 pb-10 pt-3 md:px-8">
        <div className="cinematic-banner overflow-hidden rounded-sm border border-border bg-[#090909]">
          <div className="relative p-5 md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(229,9,20,0.22),transparent_32%),linear-gradient(90deg,rgba(10,10,10,0.98),rgba(10,10,10,0.72),rgba(10,10,10,0.92))]" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div
                  className="rt-page-fade-up mb-3 inline-flex items-center gap-2 rounded-sm bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                  style={{ "--rt-enter-delay": "520ms" } as CSSProperties}
                >
                  <BadgeCheck size={13} className="text-success" aria-hidden />
                  {t("homePlusBadge")}
                </div>
                <h2
                  className="rt-page-fade-up text-[26px] font-black leading-tight tracking-[-0.03em] text-white md:text-[34px]"
                  style={{ "--rt-enter-delay": "565ms" } as CSSProperties}
                >
                  {t("homePlusTitle")}
                </h2>
                <p
                  className="rt-page-fade-up mt-3 max-w-xl text-[13px] leading-relaxed text-text-muted"
                  style={{ "--rt-enter-delay": "620ms" } as CSSProperties}
                >
                  {t("homePlusDesc")}
                </p>
              </div>
              <Link
                href="/pay/subscription?title=Reeltime%20Plus"
                className="rt-page-fade-up inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover md:self-end"
                style={{ "--rt-enter-delay": "675ms" } as CSSProperties}
              >
                {t("homePlusCta")}
                <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="rt-page-fade-up pb-10 pt-1"
        style={{ "--rt-enter-delay": "560ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeContinueWatching")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={continuePosters} />
      </section>

      <section
        className="rt-page-fade-up pb-10 pt-3"
        style={{ "--rt-enter-delay": "600ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeLateNightThrillers")}
            showSeeAll
            seeAllHref="/movies"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={thrillerPosters} />
      </section>

      <section
        className="rt-page-fade-up pb-12 pt-3"
        style={{ "--rt-enter-delay": "640ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeLibrarySpotlight")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={libraryPosters} />
      </section>
    </PageShell>
  );
}
