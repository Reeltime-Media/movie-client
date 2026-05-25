"use client";

import { Film, PlayCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { CinematicDecor } from "../components/CinematicDecor";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { useI18n } from "../components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { marketingImages } from "@/lib/marketing-images";
import { listMovies } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/to-poster";
import { isLoggedIn } from "@/lib/api/client";
import type { PosterCardProps } from "@/app/components/PosterCard";
import type { ContentRead } from "@/lib/api/types";

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

export default function MoviesPage() {
  const { t } = useI18n();
  const [activeGenre, setActiveGenre] = useState<MovieGenreKey>("genreAll");
  const [trendingPosters, setTrendingPosters] = useState<PosterCardProps[]>([]);
  const [actionPosters, setActionPosters] = useState<PosterCardProps[]>([]);
  const [featuredPoster, setFeaturedPoster] = useState<PosterCardProps | null>(null);
  const [featuredMovie, setFeaturedMovie] = useState<ContentRead | null>(null);

  useEffect(() => {
    const purchasesPromise = isLoggedIn() ? listPurchases().catch(() => []) : Promise.resolve([]);
    Promise.all([listMovies(), purchasesPromise]).then(([movies, purchases]) => {
      if (!movies.length) return;
      const ownedIds = new Set(purchases.map((p) => p.content_id));
      const all = movies.map((m, i) => movieToPoster(m, i, ownedIds));
      setTrendingPosters(all);
      setActionPosters(all.slice().reverse());
      setFeaturedPoster(all[0]);
      setFeaturedMovie(movies[0] ?? null);
    }).catch(() => {});
  }, []);

  const featured = featuredPoster ?? trendingPosters[0];

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
        className="rt-page-fade-in border-b border-border px-6 md:px-8"
        style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
      >
        <div
          className="-mx-1 flex items-center gap-1 overflow-x-auto pt-1 pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {MOVIE_GENRE_KEYS.map((g, i) => {
            const selected = g === activeGenre;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGenre(g)}
                className={[
                  "rt-page-fade-up shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  selected
                    ? "bg-brand text-white"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text",
                ].join(" ")}
                style={{ "--rt-enter-delay": `${240 + i * 35}ms` } as CSSProperties}
              >
                {t(g)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rt-page-fade-up border-b border-border px-6 py-4 md:px-8"
        style={{ "--rt-enter-delay": "320ms" } as CSSProperties}
      >
        <PageSearchBar
          label={t("moviesSearchLabel")}
          placeholder={t("moviesSearchPlaceholder")}
        />
      </div>

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
                  <div className="mb-1.5 inline-block rounded-sm bg-brand px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white">
                    {t("moviesStaffPick")}
                  </div>
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

      <section
        className="rt-page-fade-up pt-6 pb-8"
        style={{ "--rt-enter-delay": "460ms" } as CSSProperties}
      >
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("moviesTrendingTitle")}
            showSeeAll
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={trendingPosters} imagePriorityCount={2} />
      </section>

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
    </PageShell>
  );
}
