"use client";

import { Info, PlayCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { posterUrl } from "@/lib/api/client";
import { listHeroFeatured, type HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";
import { useI18n } from "./LocaleProvider";
import { HeroBackground } from "./HeroBackground";

const AUTO_MS = 6500;
const HERO_DESC_MAX_WORDS = 25;

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

const ACCENT_PALETTE = [
  "#E50914", "#b08fd9", "#d4a04a", "#ed7aa6",
  "#5cb8d4", "#d4cc5c", "#5cd49a", "#e8965c",
];

type HeroSlide = {
  id: string;
  title: string;
  year: string;
  duration: string;
  rating: string;
  genres: string;
  description: string;
  imageSrc: string;
  watchHref: string;
  accentColor: string;
};

function slideFromFeatured(slide: HeroFeaturedSlide, index: number): HeroSlide {
  return {
    id: slide.id,
    title: slide.title,
    year: slide.release_year?.toString() ?? "",
    duration: slide.runtime ?? (slide.content_type === "series" ? "Series" : ""),
    rating: slide.rating != null ? String(slide.rating) : "",
    genres: (slide.genres ?? []).join(" · "),
    description: slide.description ?? "",
    imageSrc: posterUrl(slide.poster_key) ?? "",
    watchHref: slide.watch_href,
    accentColor: ACCENT_PALETTE[index % ACCENT_PALETTE.length]!,
  };
}

function buildFallbackSlides(
  movies: ContentListItemRead[],
  seriesList: SeriesRead[],
): HeroSlide[] {
  const movieSlides = movies.slice(0, 3).map((m, i) => ({
    id: m.id,
    title: m.title,
    year: m.release_year?.toString() ?? "",
    duration: m.runtime ?? "",
    rating: m.rating != null ? String(m.rating) : "",
    genres: (m.genres ?? []).join(" · "),
    description: m.description ?? "",
    imageSrc: posterUrl(m.poster_key) ?? "",
    watchHref: `/watch?slug=${m.slug}`,
    accentColor: ACCENT_PALETTE[i % ACCENT_PALETTE.length]!,
  }));
  const seriesSlides = seriesList.slice(0, 2).map((s, i) => ({
    id: s.id,
    title: s.title,
    year: s.release_year?.toString() ?? "",
    duration: "Series",
    rating: s.rating != null ? String(s.rating) : "",
    genres: (s.genres ?? []).join(" · "),
    description: s.description ?? "",
    imageSrc: posterUrl(s.poster_key) ?? "",
    watchHref: `/watch/series/${s.slug}/1/1`,
    accentColor: ACCENT_PALETTE[(movieSlides.length + i) % ACCENT_PALETTE.length]!,
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

  // Always refresh from API on the client so admin picks appear without waiting
  // for the home page ISR cache (catalog can stay cached for minutes).
  useEffect(() => {
    let cancelled = false;
    listHeroFeatured("home", { cache: "no-store" })
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
  }, []);

  const slides = useMemo(() => {
    if (featuredSlides.length > 0) {
      return featuredSlides.map(slideFromFeatured);
    }
    return buildFallbackSlides(fallbackMovies, fallbackSeries);
  }, [featuredSlides, fallbackMovies, fallbackSeries]);

  const total = slides.length;

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

  const activeSlide = slides[active];
  const indexLabel = String(active + 1).padStart(2, "0");
  const totalLabel = String(Math.max(total, 1)).padStart(2, "0");

  return (
    <section className="hero-featured relative ml-[calc(50%-50vw)] h-[460px] w-screen max-w-none shrink-0 overflow-hidden">
      <HeroBackground />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-bg via-bg/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] max-w-[900px] bg-gradient-to-r from-bg/92 via-bg/45 to-transparent" />

      <div className="relative z-[2] h-full">
        <div className="flex h-full w-full items-end justify-between gap-8 px-6 pb-12 md:gap-12 md:px-12 md:pb-16">
          <div className="relative min-w-0 max-w-[520px]">
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

                  <h1 className="text-[56px] font-black leading-[0.95] tracking-[-0.035em] text-text">
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
                    <p className="mt-5 max-w-[440px] text-[14px] leading-[1.65] text-text/80">
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
                      className="inline-flex items-center gap-2 rounded-[6px] border border-white/15 bg-white/[0.06] px-6 py-3 text-[13px] font-semibold text-text/90 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.12]"
                    >
                      <Info size={15} />
                      {t("heroMoreInfo")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {activeSlide && (
            <Link
              href={activeSlide.watchHref}
              className="group/pstr relative hidden shrink-0 md:block"
              aria-label={`Watch ${activeSlide.title}`}
            >
              <div className="relative aspect-[2/3] w-[200px] overflow-hidden rounded-[4px] border border-border bg-surface transition-colors duration-200 group-hover/pstr:border-border-hover lg:w-[248px]">
                {slides.map((s, i) => (
                  <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                      i === active ? "z-[1] opacity-100" : "z-0 opacity-0"
                    }`}
                  >
                    {s.imageSrc ? (
                      <Image
                        src={s.imageSrc}
                        alt={`${s.title} key art`}
                        fill
                        sizes="(max-width: 1024px) 200px, 248px"
                        quality={88}
                        loading="eager"
                        className="object-cover object-[center_12%] transition-transform duration-500 ease-out group-hover/pstr:scale-[1.02]"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-elevated" />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[4px] bg-gradient-to-t from-black/45 via-transparent to-black/20"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[4px] ring-1 ring-inset ring-white/[0.06]"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
              <div
                className="mx-auto mt-2 h-[2px] w-[72px] max-w-full rounded-full transition-colors duration-500 ease-out"
                style={{ backgroundColor: activeSlide.accentColor }}
                aria-hidden="true"
              />
            </Link>
          )}
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
