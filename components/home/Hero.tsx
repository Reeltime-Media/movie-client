"use client";

import { Info, PlayCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { posterUrl } from "@/lib/api/client";
import { listHeroFeatured, type HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";
import { HeroBackground } from "@/components/home/HeroBackground";
import { useI18n } from "@/components/providers/LocaleProvider";

const AUTO_MS = 6500;
const HERO_DESC_MAX_WORDS = 25;

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

type HeroSlide = {
  id: string;
  title: string;
  year: string;
  duration: string;
  rating: string;
  genres: string;
  description: string;
  bannerSrc: string;
  watchHref: string;
};

function bannerImageSrc(bannerKey?: string | null): string {
  return posterUrl(bannerKey) ?? "";
}

function slideFromFeatured(slide: HeroFeaturedSlide): HeroSlide {
  return {
    id: slide.id,
    title: slide.title,
    year: slide.release_year?.toString() ?? "",
    duration: slide.runtime ?? (slide.content_type === "series" ? "Series" : ""),
    rating: slide.rating != null ? String(slide.rating) : "",
    genres: (slide.genres ?? []).join(" · "),
    description: slide.description ?? "",
    bannerSrc: bannerImageSrc(slide.banner_key),
    watchHref: slide.watch_href,
  };
}

function buildFallbackSlides(
  movies: ContentListItemRead[],
  seriesList: SeriesRead[],
): HeroSlide[] {
  const movieSlides = movies.slice(0, 3).map((m) => ({
    id: m.id,
    title: m.title,
    year: m.release_year?.toString() ?? "",
    duration: m.runtime ?? "",
    rating: m.rating != null ? String(m.rating) : "",
    genres: (m.genres ?? []).join(" · "),
    description: m.description ?? "",
    bannerSrc: "",
    watchHref: `/watch?slug=${m.slug}`,
  }));
  const seriesSlides = seriesList.slice(0, 2).map((s) => ({
    id: s.id,
    title: s.title,
    year: s.release_year?.toString() ?? "",
    duration: "Series",
    rating: s.rating != null ? String(s.rating) : "",
    genres: (s.genres ?? []).join(" · "),
    description: s.description ?? "",
    bannerSrc: bannerImageSrc(s.banner_key),
    watchHref: `/watch/series/${s.slug}/1/1`,
  }));
  return [...movieSlides, ...seriesSlides];
}

type HeroProps = {
  featuredSlides?: HeroFeaturedSlide[];
  fallbackMovies?: ContentListItemRead[];
  fallbackSeries?: SeriesRead[];
};

export function Hero({
  featuredSlides: initialFeaturedSlides = [],
  fallbackMovies = [],
  fallbackSeries = [],
}: HeroProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [featuredSlides, setFeaturedSlides] = useState(initialFeaturedSlides);

  useEffect(() => {
    setFeaturedSlides(initialFeaturedSlides);
  }, [initialFeaturedSlides]);

  useEffect(() => {
    if (initialFeaturedSlides.length > 0) return;
    let cancelled = false;
    listHeroFeatured("home")
      .then((slides) => {
        if (!cancelled && slides.length > 0) {
          setFeaturedSlides(slides);
        }
      })
      .catch((err) => {
        console.error("Hero featured refresh failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [initialFeaturedSlides.length]);

  const slides = useMemo(() => {
    if (featuredSlides.length > 0) {
      return featuredSlides.map(slideFromFeatured);
    }
    return buildFallbackSlides(fallbackMovies, fallbackSeries);
  }, [featuredSlides, fallbackMovies, fallbackSeries]);

  const total = slides.length;
  const hasBannerBackground = slides.some((s) => Boolean(s.bannerSrc));

  useEffect(() => {
    setActive(0);
  }, [slides]);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % Math.max(total, 1));
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(id);
  }, [goNext, total]);

  const indexLabel = String(active + 1).padStart(2, "0");
  const totalLabel = String(Math.max(total, 1)).padStart(2, "0");

  return (
    <section className="hero-featured relative ml-[calc(50%-50vw)] h-[min(52vh,520px)] min-h-[400px] w-screen max-w-none shrink-0 overflow-hidden">
      {hasBannerBackground ? (
        slides.map((s, i) => (
          <div
            key={s.id}
            className={[
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === active ? "z-0 opacity-100" : "z-0 opacity-0",
            ].join(" ")}
            aria-hidden={i !== active}
          >
            {s.bannerSrc ? (
              <Image
                src={s.bannerSrc}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                quality={90}
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-elevated" />
            )}
          </div>
        ))
      ) : (
        <HeroBackground />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[60%] bg-gradient-to-t from-bg from-10% via-bg/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[55%] max-w-[780px] bg-gradient-to-r from-bg/95 via-bg/50 to-transparent" />

      <div className="relative z-[2] h-full">
        <div className="flex h-full w-full items-end px-6 pb-12 md:px-12 md:pb-16">
          <div className="relative min-w-0 max-w-[640px]">
            {slides.length === 0 ? (
              <div className="animate-pulse space-y-4">
                <div className="h-3 w-24 rounded bg-surface-elevated" />
                <div className="h-14 w-80 rounded bg-surface-elevated" />
                <div className="h-3 w-48 rounded bg-surface-elevated" />
                <div className="h-16 w-96 rounded bg-surface-elevated" />
              </div>
            ) : (
              slides.map((s, i) => (
                <div
                  key={s.id}
                  className={`transition-opacity duration-500 ease-out ${
                    i === active
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute inset-0 z-0 opacity-0"
                  }`}
                  aria-hidden={i !== active}
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="h-[1px] w-8 bg-brand" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                      {t("heroFeatured")}
                    </span>
                  </div>

                  <h1 className="text-[40px] font-black leading-[0.95] tracking-[-0.035em] text-text drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-[52px] md:text-[56px]">
                    {s.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-text-muted">
                    {s.year && <span className="text-text/90">{s.year}</span>}
                    {s.year && s.duration && <span className="text-border">·</span>}
                    {s.duration && <span>{s.duration}</span>}
                    {s.rating && (
                      <>
                        <span className="text-border">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="fill-warning text-warning" />
                          <span className="text-text/90">{s.rating}</span>
                        </span>
                      </>
                    )}
                    {s.genres && (
                      <>
                        <span className="text-border">·</span>
                        <span>{s.genres}</span>
                      </>
                    )}
                  </div>

                  {s.description && (
                    <p className="mt-5 max-w-[440px] text-[14px] leading-[1.65] text-text/85">
                      {truncateWords(s.description, HERO_DESC_MAX_WORDS)}
                    </p>
                  )}

                  <div className="mt-7 flex items-center gap-3">
                    <Link
                      href={s.watchHref}
                      className="group inline-flex items-center gap-2 rounded-[6px] bg-brand px-7 py-3 text-[14px] font-bold text-white shadow-[0_4px_24px_-4px_rgba(229,9,20,0.5)] transition-all hover:bg-brand-hover hover:shadow-[0_4px_24px_-4px_rgba(229,9,20,0.7)]"
                    >
                      <PlayCircle size={18} className="fill-white text-brand" />
                      {t("heroWatchNow")}
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-[6px] border border-white/15 bg-black/35 px-6 py-3 text-[13px] font-semibold text-text/90 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-black/50"
                    >
                      <Info size={15} />
                      {t("heroMoreInfo")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-8 right-12 z-[3] flex items-center gap-3">
            <span className="text-[11px] font-medium tabular-nums text-text-muted">
              {indexLabel}
              <span className="text-border"> / </span>
              <span className="text-text-muted/60">{totalLabel}</span>
            </span>
            <div className="flex items-center gap-1.5" role="tablist" aria-label={t("heroFeaturedTitlesAria")}>
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show ${s.title}`}
                  onClick={() => setActive(i)}
                  className={`h-[2px] rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-8 bg-brand"
                      : "w-4 bg-text-muted/30 hover:bg-text-muted/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
