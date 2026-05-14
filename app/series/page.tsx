"use client";

import { Layers, ListVideo, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useI18n } from "../components/LocaleProvider";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import type { TranslationKey } from "@/lib/i18n";
import { seriesPopularPosters, seriesSubscribePosters } from "../mock/posters";

const SERIES_GENRE_KEYS = [
  "genreAll",
  "genreDrama",
  "genreThriller",
  "genreSciFi",
  "genreComedy",
  "genreCrime",
  "genreAction",
] as const satisfies readonly TranslationKey[];

type SeriesGenreKey = (typeof SERIES_GENRE_KEYS)[number];

export default function SeriesPage() {
  const { t } = useI18n();
  const [activeGenre, setActiveGenre] = useState<SeriesGenreKey>("genreAll");

  return (
    <PageShell wide>
      <div className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="rt-series-hero-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_-20%,rgba(229,9,20,0.18),transparent_50%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-surface/40 to-transparent" />
        <div className="relative px-6 pb-6 pt-8 md:px-8 md:pb-7 md:pt-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className="rt-series-fade-up mb-3 inline-flex items-center gap-2 rounded-sm border border-border bg-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted backdrop-blur-sm"
                style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
              >
                <Layers size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
                {t("seriesBadge")}
              </div>
              <h1
                className="rt-series-fade-up text-balance text-[clamp(1.625rem,3.5vw,2.125rem)] font-extrabold leading-[1.08] tracking-tight text-text"
                style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
              >
                {t("seriesHeroTitle")}
              </h1>
              <p
                className="rt-series-fade-up mt-2.5 max-w-lg text-[13px] leading-relaxed text-text-muted"
                style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
              >
                {t("seriesHeroDesc")}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                className="rt-series-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-border-hover hover:text-text active:translate-y-0"
                style={{ "--rt-enter-delay": "160ms" } as CSSProperties}
              >
                <Sparkles size={14} strokeWidth={2} aria-hidden />
                {t("seriesNewWeek")}
              </button>
              <button
                type="button"
                className="rt-series-fade-up inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-border-hover hover:text-text active:translate-y-0"
                style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
              >
                <ListVideo size={14} strokeWidth={2} aria-hidden />
                {t("seriesContinue")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rt-series-fade-in border-b border-border bg-bg px-6 py-3 md:px-8"
        style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
      >
        <div
          className="flex max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("seriesFilterAria")}
        >
          {SERIES_GENRE_KEYS.map((g, i) => {
            const selected = g === activeGenre;
            return (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveGenre(g)}
                className={[
                  "rt-series-fade-up shrink-0 cursor-pointer rounded-sm px-3.5 py-2 text-[12px] font-semibold transition-[transform,colors,background-color] duration-200 ease-out",
                  selected
                    ? "bg-brand text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text active:scale-[0.98]",
                ].join(" ")}
                style={{ "--rt-enter-delay": `${280 + i * 40}ms` } as CSSProperties}
              >
                {t(g)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rt-series-fade-up border-b border-border px-6 py-4 md:px-8"
        style={{ "--rt-enter-delay": "320ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageSearchBar
            label={t("seriesSearchLabel")}
            placeholder={t("seriesSearchPlaceholder")}
          />
          <div className="flex shrink-0 items-center gap-2 text-[12px] text-text-muted">
            <span className="hidden sm:inline">{t("seriesSort")}</span>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-medium text-text transition-colors duration-200">
              {t("seriesPopularSort")}
            </span>
          </div>
        </div>
      </div>

      <section
        className="rt-series-fade-up pb-8 pt-8"
        style={{ "--rt-enter-delay": "460ms" } as CSSProperties}
      >
        <div className="space-y-1 px-6 md:px-8">
          <SectionHeader title={t("seriesSubscribeTitle")} />
          <p className="text-[12px] font-medium text-text-muted">{t("seriesSubscribeSub")}</p>
        </div>
        <PosterScrollRail posters={seriesSubscribePosters} imagePriorityCount={2} />
      </section>

      <section
        className="rt-series-fade-up pb-12 pt-2"
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
        <PosterScrollRail posters={seriesPopularPosters} />
      </section>
    </PageShell>
  );
}
