"use client";

import { PlayCircle } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { posterUrl } from "@/lib/api/core";
import type { PromotionBannerRead } from "@/lib/api/catalog";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { HeroBackground } from "@/components/home/HeroBackground";
import { useI18n } from "@/components/providers/LocaleProvider";

const AUTO_MS = 6500;

export function PromotionBannerStrip({ banners }: { banners: PromotionBannerRead[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const total = banners.length;

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

  if (!banners.length) return null;

  const indexLabel = String(active + 1).padStart(2, "0");
  const totalLabel = String(Math.max(total, 1)).padStart(2, "0");
  const hasImageBackground = banners.some((banner) => Boolean(posterUrl(banner.image_key)));

  return (
    <section className="hero-featured relative mx-4 mt-4 aspect-[12/5] shrink-0 overflow-hidden rounded-md bg-black sm:mx-6 sm:mt-6 md:mx-8">
      {hasImageBackground ? (
        banners.map((banner, i) => {
          const imageSrc = posterUrl(banner.image_key);

          return (
            <div
              key={banner.id}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === active ? "z-0 opacity-100" : "z-0 opacity-0",
              ].join(" ")}
              aria-hidden={i !== active}
            >
              {imageSrc ? (
                <CdnImage
                  src={imageSrc}
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
          );
        })
      ) : (
        <HeroBackground idPrefix="rt-hero-promo" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[60%] bg-linear-to-t from-black/90 via-black/50 to-transparent sm:from-bg sm:via-bg/90" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-1 hidden w-[58%] max-w-225 bg-linear-to-r from-bg/92 via-bg/45 to-transparent sm:block" />

      <div className="relative z-2 h-full">
        <div className="flex h-full w-full items-end px-4 pb-6 sm:px-6 sm:pb-12 md:px-12 md:pb-16">
          <div className="relative min-w-0 max-w-[640px]">
            {banners.map((banner, i) => {
              const ctaHref = banner.cta_href
                ? safeRedirectPath(banner.cta_href, "/pricing")
                : null;

              return (
                <div
                  key={banner.id}
                  className={`transition-opacity duration-500 ease-out ${
                    i === active
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none absolute inset-0 z-0 opacity-0"
                  }`}
                  aria-hidden={i !== active}
                >
                  <div className="mb-3 flex items-center gap-2.5 sm:mb-5">
                    <div className="h-px w-8 bg-brand" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                      {t("promotionEyebrow")}
                    </span>
                  </div>

                  <h2 className="text-[20px] font-black leading-[1.05] tracking-[-0.02em] text-text sm:text-[40px] sm:leading-[0.95] md:text-[52px] sm:tracking-[-0.035em]">
                    {banner.title}
                  </h2>

                  {banner.subtitle ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-text/80 sm:mt-5 sm:max-w-110 sm:text-[14px] sm:leading-[1.65]">
                      {banner.subtitle}
                    </p>
                  ) : null}

                  {ctaHref && banner.cta_label ? (
                    <div className="mt-3 flex items-center gap-3 sm:mt-7">
                      <Link
                        href={ctaHref}
                        className="group inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-[12px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover sm:gap-2 sm:px-7 sm:py-3 sm:text-[14px]"
                      >
                        <PlayCircle size={16} className="fill-white text-brand sm:size-4.5" />
                        {banner.cta_label}
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {total > 1 ? (
          <div className="absolute bottom-4 right-4 z-3 flex items-center gap-2.5 sm:bottom-8 sm:right-12 sm:gap-3">
            <span className="hidden text-[11px] font-medium tabular-nums text-text-muted sm:inline">
              {indexLabel}
              <span className="text-border"> / </span>
              <span className="text-text-muted/60">{totalLabel}</span>
            </span>
            <div
              className="flex items-center gap-1.5"
              role="tablist"
              aria-label={t("promotionSlidesAria")}
            >
              {banners.map((banner, i) => (
                <button
                  key={banner.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={banner.title}
                  onClick={() => setActive(i)}
                  className="flex cursor-pointer items-center py-3"
                >
                  <span
                    className={`block h-0.75 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-brand"
                        : "w-4 bg-text-muted/30 hover:bg-text-muted/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
