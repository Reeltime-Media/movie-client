"use client";

import { PlayCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { posterUrl } from "@/lib/api/client";
import { listHeroFeatured, type HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";
import { HeroBackground } from "@/components/home/HeroBackground";
import { useI18n } from "@/components/providers/LocaleProvider";

const AUTO_MS = 6500;

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
    <section className="hero-featured relative ml-[calc(50%-50vw)] aspect-video sm:aspect-auto sm:h-[min(58vh,520px)] sm:min-h-96 md:min-h-110 w-screen max-w-none shrink-0 overflow-hidden bg-black">
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
                className="object-contain sm:object-cover object-center sm:object-[center_15%]"
              />
            ) : (
              <div className="absolute inset-0 bg-surface-elevated" />
            )}
          </div>
        ))
      ) : (
        <HeroBackground />
      )}

      {/* Bottom gradient for text readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[60%] bg-linear-to-t from-black/90 via-black/50 to-transparent sm:h-[50%] sm:from-black/85 sm:via-black/40" />

      <div className="relative z-2 h-full">
        <div className="flex h-full w-full items-end justify-between px-4 pb-6 sm:px-6 sm:pb-8 md:px-12 md:pb-10">
          {/* Left: title + year + button */}
          <div className="relative min-w-0 max-w-xl">
            {slides.length === 0 ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-64 rounded bg-white/10" />
                <div className="h-4 w-20 rounded bg-white/10" />
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
                  <h1 className="text-[20px] font-black leading-tight tracking-[-0.02em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[34px] md:text-[38px]">
                    {s.title}
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-white/70 sm:mt-1.5 sm:gap-x-2 sm:text-[13px]">
                    {s.year && <span>{s.year}</span>}
                    {s.rating && (
                      <>
                        <span className="text-white/30">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Star size={11} className="fill-warning text-warning" />
                          <span>{s.rating}</span>
                        </span>
                      </>
                    )}
                    {s.duration && (
                      <>
                        <span className="text-white/30">·</span>
                        <span>{s.duration}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <Link
                      href={s.watchHref}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-hover sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]"
                    >
                      <PlayCircle size={15} className="fill-white text-brand" />
                      {t("heroWatchNow")}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-6 right-4 z-3 flex items-center gap-2.5 sm:bottom-8 sm:right-12 sm:gap-3">
            {/* Counter: hidden on mobile to avoid overlap with title */}
            <span className="hidden text-[11px] font-medium tabular-nums text-text-muted sm:inline">
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
                  className="flex cursor-pointer items-center py-3"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      i === active
                        ? "h-0.75 w-8 bg-brand"
                        : "h-0.75 w-4 bg-text-muted/30 hover:bg-text-muted/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
