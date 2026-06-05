"use client";

import { Layers, ListVideo, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { GenreFilterSelect } from "@/components/catalog/GenreFilterSelect";
import { PageSearchBar } from "@/components/catalog/PageSearchBar";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { marketingImages } from "@/lib/marketing-images";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { seriesToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import {
  CATALOG_GENRE_KEYS,
  type CatalogGenreKey,
  matchesGenre,
  matchesSearch,
} from "@/lib/catalog-filter";
import type { PosterCardProps } from "@/types/poster-card";
import type { SeasonRead, SeriesRead } from "@/lib/api/types";

type SeriesViewProps = {
  seriesList: SeriesRead[];
  seasons: SeasonRead[][];
  initialSubscribe: PosterCardProps[];
  initialPopular: PosterCardProps[];
};

export function SeriesView({
  seriesList,
  seasons,
  initialSubscribe,
  initialPopular,
}: SeriesViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const [activeGenre, setActiveGenre] = useState<CatalogGenreKey>("genreAll");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);

  const filteredSeries = useMemo(
    () =>
      seriesList.filter(
        (s) => matchesSearch(s, searchQuery) && matchesGenre(s, activeGenre),
      ),
    [seriesList, searchQuery, activeGenre],
  );

  const allPosters = useMemo(
    () =>
      filteredSeries.map((s) => {
        const index = seriesList.findIndex((row) => row.id === s.id);
        return seriesToPoster(s, index, {
          hasSubscription,
          seasons: seasons[index] ?? [],
        });
      }),
    [filteredSeries, seriesList, seasons, hasSubscription],
  );

  const subscribePosters = useMemo(() => {
    const half = Math.ceil(allPosters.length / 2);
    return allPosters.slice(0, half);
  }, [allPosters]);

  const popularPosters = useMemo(() => {
    const half = Math.ceil(allPosters.length / 2);
    return allPosters.slice(half);
  }, [allPosters]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || activeGenre !== "genreAll";

  useEffect(() => {
    if (!loggedIn || !seriesList.length) return;
    let cancelled = false;
    listMySubscriptions()
      .catch(() => [])
      .then((subs) => {
        if (cancelled) return;
        setHasSubscription(subs.some((s) => s.status === "active"));
      });
    return () => {
      cancelled = true;
    };
  }, [seriesList, loggedIn]);

  return (
    <PageShell wide>
      <CinematicDecor
        imageSrc={marketingImages.cinemaCurtains}
        imageDescription="Classic red cinema curtains and velvet seats"
        showBrandGlow
        minHeightClass="min-h-[220px] sm:min-h-[260px] md:min-h-[300px]"
        viewportBleed
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div
              className="rt-page-fade-up mb-3 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm"
              style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
            >
              <Layers size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
              {t("seriesBadge")}
            </div>
            <h1
              className={["rt-page-fade-up", pageTitleOnHeroClassName].join(" ")}
              style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
            >
              {t("seriesHeroTitle")}
            </h1>
            <p
              className="rt-page-fade-up mt-2.5 max-w-lg text-[13px] leading-relaxed text-white/78"
              style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
            >
              {t("seriesHeroDesc")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              className="rt-page-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-white/28 hover:bg-white/16 active:translate-y-0"
              style={{ "--rt-enter-delay": "160ms" } as CSSProperties}
            >
              <Sparkles size={14} strokeWidth={2} aria-hidden />
              {t("seriesNewWeek")}
            </button>
            <button
              type="button"
              className="rt-page-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-white/28 hover:bg-white/16 active:translate-y-0"
              style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
            >
              <ListVideo size={14} strokeWidth={2} aria-hidden />
              {t("seriesContinue")}
            </button>
          </div>
        </div>
      </CinematicDecor>

      <div
        className="rt-page-fade-up border-b border-border px-6 py-4 md:px-8"
        style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <PageSearchBar
            className="max-w-none min-w-0 flex-1"
            label={t("seriesSearchLabel")}
            placeholder={t("seriesSearchPlaceholder")}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <GenreFilterSelect
            className="w-full sm:w-44"
            label={t("moviesFilterGenre")}
            value={activeGenre}
            onChange={setActiveGenre}
            options={CATALOG_GENRE_KEYS.map((key) => ({
              value: key,
              label: t(key),
            }))}
          />
        </div>
      </div>

      {hasActiveFilters && allPosters.length === 0 ? (
        <div className="px-6 py-10 text-center md:px-8">
          <p className="text-[14px] font-semibold text-text-muted">{t("searchNoResults")}</p>
        </div>
      ) : null}

      {hasActiveFilters && allPosters.length > 0 ? (
        <section
          className="rt-page-fade-up pb-12 pt-8"
          style={{ "--rt-enter-delay": "460ms" } as CSSProperties}
        >
          <div className="px-6 md:px-8">
            <SectionHeader title={t("seriesBadge")} />
          </div>
          <PosterScrollRail posters={allPosters} imagePriorityCount={2} />
        </section>
      ) : null}

      {!hasActiveFilters && subscribePosters.length > 0 ? (
        <section
          className="rt-page-fade-up pb-8 pt-8"
          style={{ "--rt-enter-delay": "460ms" } as CSSProperties}
        >
          <div className="space-y-1 px-6 md:px-8">
            <SectionHeader title={t("seriesSubscribeTitle")} />
            <p className="text-[12px] font-medium text-text-muted">{t("seriesSubscribeSub")}</p>
          </div>
          <PosterScrollRail posters={subscribePosters} imagePriorityCount={2} />
        </section>
      ) : null}

      {!hasActiveFilters && popularPosters.length > 0 ? (
        <section
          className="rt-page-fade-up pb-12 pt-2"
          style={{ "--rt-enter-delay": "520ms" } as CSSProperties}
        >
          <div className="space-y-1 px-6 md:px-8">
            <SectionHeader
              title={t("seriesPopularTitle")}
              showSeeAll
              seeAllLabel={t("sectionSeeAll")}
            />
            <p className="text-[12px] font-medium text-text-muted">{t("seriesPopularSub")}</p>
          </div>
          <PosterScrollRail posters={popularPosters} />
        </section>
      ) : null}
    </PageShell>
  );
}
