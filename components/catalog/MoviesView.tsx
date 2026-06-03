"use client";

import { Film, PlayCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { GenreFilterSelect } from "@/components/catalog/GenreFilterSelect";
import { PageSearchBar } from "@/components/catalog/PageSearchBar";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { TranslationKey } from "@/lib/i18n";
import { marketingImages } from "@/lib/marketing-images";
import { listPurchases } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import { matchesGenre, matchesSearch } from "@/lib/catalog-filter";
import type { PosterCardProps } from "@/types/poster-card";
import type { ContentListItemRead } from "@/lib/api/types";

const MOVIE_GENRE_KEYS = [
  "genreAll",
  "genreAction",
  "genreThriller",
  "genreDrama",
  "genreSciFi",
  "genreHorror",
  "genreComedy",
] as const satisfies readonly TranslationKey[];

type MovieGenreKey = (typeof MOVIE_GENRE_KEYS)[number];

type MoviesViewProps = {
  movies: ContentListItemRead[];
  initialPosters: PosterCardProps[];
};

export function MoviesView({ movies, initialPosters }: MoviesViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const [activeGenre, setActiveGenre] = useState<MovieGenreKey>("genreAll");
  const [searchQuery, setSearchQuery] = useState("");
  const [ownedIds, setOwnedIds] = useState<Set<string> | null>(null);

  const filteredMovies = useMemo(
    () =>
      movies.filter(
        (m) => matchesSearch(m, searchQuery) && matchesGenre(m, activeGenre),
      ),
    [movies, searchQuery, activeGenre],
  );

  const trendingPosters = useMemo(
    () =>
      filteredMovies.map((m, i) =>
        movieToPoster(m, i, ownedIds ?? undefined),
      ),
    [filteredMovies, ownedIds],
  );

  const actionPosters = useMemo(
    () => [...trendingPosters].reverse(),
    [trendingPosters],
  );

  const featured = trendingPosters[0];
  const featuredMovie = filteredMovies[0] ?? null;
  const hasActiveFilters =
    searchQuery.trim().length > 0 || activeGenre !== "genreAll";

  useEffect(() => {
    if (!loggedIn || !movies.length) return;
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
  }, [movies, loggedIn]);

  return (
    <PageShell wide>
      <CinematicDecor
        imageSrc={marketingImages.filmProjector}
        imageDescription="Vintage film projector and reels in a dark room"
        minHeightClass="min-h-[200px] sm:min-h-[240px] md:min-h-[260px]"
        viewportBleed
      >
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="rt-page-fade-up mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80"
              style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
            >
              <Film size={13} className="text-white/90" aria-hidden /> {t("moviesBadge")}
            </div>
            <h1
              className="rt-page-fade-up max-w-[18ch] text-[28px] font-extrabold tracking-[-0.02em] text-white md:text-[32px]"
              style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
            >
              {t("moviesTitle")}
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              className="rt-page-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:border-white/28 hover:bg-white/16"
              style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
            >
              <Sparkles size={13} aria-hidden /> {t("moviesCurated")}
            </button>
            <button
              type="button"
              className="rt-page-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-[12px] font-medium text-white backdrop-blur-sm transition-colors hover:border-white/28 hover:bg-white/16"
              style={{ "--rt-enter-delay": "155ms" } as CSSProperties}
            >
              <TrendingUp size={13} aria-hidden /> {t("moviesMostWatched")}
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
            label={t("moviesSearchLabel")}
            placeholder={t("moviesSearchPlaceholder")}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <GenreFilterSelect
            className="w-full sm:w-44"
            label={t("moviesFilterGenre")}
            value={activeGenre}
            onChange={setActiveGenre}
            options={MOVIE_GENRE_KEYS.map((key) => ({
              value: key,
              label: t(key),
            }))}
          />
        </div>
      </div>

      {hasActiveFilters && trendingPosters.length === 0 ? (
        <div className="px-6 py-10 text-center md:px-8">
          <p className="text-[14px] font-semibold text-text-muted">{t("searchNoResults")}</p>
        </div>
      ) : null}

      {featured && (
        <div
          className="rt-page-fade-up mx-6 mt-6 overflow-hidden rounded-md border border-border bg-surface-elevated md:mx-8"
          style={{ "--rt-enter-delay": "380ms" } as CSSProperties}
        >
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="relative h-48 w-full shrink-0 border-b border-border md:h-auto md:min-h-50 md:w-50 md:border-b-0 md:border-r md:border-border">
              {featured.imageSrc ? (
                <Image
                  src={featured.imageSrc}
                  alt={`${featured.titleBelow} poster`}
                  fill
                  className="object-cover object-[center_15%]"
                  sizes="(min-width: 768px) 200px, 100vw"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: featured.posterGradient }}
                />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 to-transparent md:bg-linear-to-r md:from-transparent md:to-surface-elevated"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-text">
                    {featured.titleBelow}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                    <Star size={11} className="fill-warning text-warning" aria-hidden />
                    <span>{t("moviesStaffPick")}</span>
                  </div>
                  {featuredMovie?.description ? (
                    <p className="mt-2 line-clamp-3 max-w-[52ch] text-[12px] leading-relaxed text-text-muted">
                      {featuredMovie.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={featured.watchHref ?? "#"}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
                  >
                    <PlayCircle size={14} aria-hidden />
                    {featured.entitlement?.kind === "price"
                      ? `Buy · ${featured.entitlement.value}`
                      : "Watch"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {trendingPosters.length > 0 ? (
        <section
          className="rt-page-fade-up pt-6 pb-8"
          style={{ "--rt-enter-delay": "460ms" } as CSSProperties}
        >
          <div className="px-6 md:px-8">
            <SectionHeader
              title={t("moviesTrendingTitle")}
              showSeeAll={!hasActiveFilters}
              seeAllLabel={t("sectionSeeAll")}
            />
          </div>
          <PosterScrollRail posters={trendingPosters} imagePriorityCount={2} />
        </section>
      ) : null}

      {actionPosters.length > 0 && !hasActiveFilters ? (
        <section
          className="rt-page-fade-up pt-2 pb-12"
          style={{ "--rt-enter-delay": "520ms" } as CSSProperties}
        >
          <div className="px-6 md:px-8">
            <SectionHeader
              title={t("moviesActionTitle")}
              showSeeAll
              seeAllLabel={t("sectionSeeAll")}
            />
          </div>
          <PosterScrollRail posters={actionPosters} />
        </section>
      ) : null}
    </PageShell>
  );
}
