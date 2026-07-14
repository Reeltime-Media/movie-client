"use client";

import { Info, PlayCircle, Star } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { listHeroFeatured, type HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";
import { HeroBackground } from "@/components/home/HeroBackground";
import { HeroVideo } from "@/components/home/HeroVideo";
import { buildFallbackSlides, slideFromFeatured } from "@/components/home/hero-slides";
import { useI18n } from "@/components/providers/LocaleProvider";

const AUTO_MS = 6500;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
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

  // Sync when the server-provided slides change (adjust-state-during-render pattern).
  const [prevInitialSlides, setPrevInitialSlides] = useState(initialFeaturedSlides);
  if (prevInitialSlides !== initialFeaturedSlides) {
    setPrevInitialSlides(initialFeaturedSlides);
    setFeaturedSlides(initialFeaturedSlides);
  }

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [failedVideoIds, setFailedVideoIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialFeaturedSlides.length > 0) return;
    let cancelled = false;
    listHeroFeatured("home")
      .then((slides) => {
        if (!cancelled && slides.length > 0) {
          setFeaturedSlides(slides);
        }
      })
      .catch(() => {});
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

  const activeSlide = slides[active] ?? null;
  const activeHasVideo = Boolean(
    activeSlide &&
      (activeSlide.videoSrc || activeSlide.youtubeUrl) &&
      !failedVideoIds.has(activeSlide.id) &&
      !reducedMotion,
  );

  const handleVideoError = useCallback(() => {
    if (!activeSlide) return;
    const id = activeSlide.id;
    setFailedVideoIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, [activeSlide]);

  // Jump back to the first slide when the slide set changes.
  const [prevSlides, setPrevSlides] = useState(slides);
  if (prevSlides !== slides) {
    setPrevSlides(slides);
    setActive(0);
  }

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % Math.max(total, 1));
  }, [total]);

  useEffect(() => {
    if (total <= 1 || reducedMotion) return;
    // While the active slide's video plays, HeroVideo drives the advance.
    if (activeHasVideo) return;
    const id = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(id);
  }, [goNext, total, reducedMotion, activeHasVideo]);

  return (
    // Banners are ultrawide (~1920x788 / 12:5). Match that ratio so object-cover
    // keeps the full width of the artwork instead of clipping the sides.
    <section className="hero-featured relative mx-4 mt-4 aspect-[12/5] shrink-0 overflow-hidden rounded-md bg-black sm:mx-6 sm:mt-6 md:mx-8">
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
              <CdnImage
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
            {i === active && activeHasVideo ? (
              <HeroVideo
                key={`video-${s.id}`}
                videoSrc={s.videoSrc}
                youtubeUrl={s.youtubeUrl}
                onEnded={goNext}
                onError={handleVideoError}
              />
            ) : null}
          </div>
        ))
      ) : (
        <>
          <HeroBackground />
          {activeSlide && activeHasVideo ? (
            <HeroVideo
              key={`video-${activeSlide.id}`}
              videoSrc={activeSlide.videoSrc}
              youtubeUrl={activeSlide.youtubeUrl}
              onEnded={goNext}
              onError={handleVideoError}
            />
          ) : null}
        </>
      )}

      {/* Text-legibility gradients — skipped for video-only slides with nothing to read */}
      {(activeSlide?.title || activeSlide?.description || activeSlide?.watchHref) && (
        <>
          {/* Bottom gradient for text readability */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[60%] bg-linear-to-t from-black/90 via-black/50 to-transparent sm:h-[50%] sm:from-black/85 sm:via-black/40" />
          {/* Left gradient — ends at 65% so description text stays legible over busy posters */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-1 w-[65%] bg-linear-to-r from-black/85 via-black/40 to-transparent" />
        </>
      )}

      <div className="pointer-events-none relative z-2 h-full">
        <div className="flex h-full w-full items-end justify-between px-4 pb-6 sm:px-6 sm:pb-8 md:px-12 md:pb-10">
          {/* Left: title + year + button */}
          <div className="pointer-events-auto relative min-w-0 max-w-xl">
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
                  <div className={i === active ? "rt-hero-text-in" : ""}>
                    {/* Video-only custom slides have no title — render no text block */}
                    {s.title && (
                      <h1 className="text-[20px] font-black leading-tight tracking-[-0.02em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[34px] md:text-[38px]">
                        {s.title}
                      </h1>
                    )}

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

                    {s.description && (
                      <p className="mt-2 hidden max-w-[420px] text-[13px] leading-relaxed text-white/70 line-clamp-2 sm:block">
                        {s.description}
                      </p>
                    )}

                    {s.watchHref ? (
                      <div className="mt-4 flex items-center gap-2.5">
                        {/* "//host" is protocol-relative — off-site, never an internal route */}
                        {s.watchHref.startsWith("http") || s.watchHref.startsWith("//") ? (
                          <a
                            href={s.watchHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]"
                          >
                            <PlayCircle size={15} className="fill-white text-brand" />
                            {t("heroWatchNow")}
                          </a>
                        ) : (
                          <Link
                            href={s.watchHref}
                            className="group inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]"
                          >
                            <PlayCircle size={15} className="fill-white text-brand" />
                            {t("heroWatchNow")}
                          </Link>
                        )}
                        {!s.isCustom ? (
                          <Link
                            href={`${s.watchHref}#details`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/18 bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white transition-colors duration-200 hover:bg-white/20 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]"
                          >
                            <Info size={14} />
                            {t("heroMoreInfo")}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
