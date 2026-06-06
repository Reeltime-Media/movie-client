"use client";

import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { posterUrl } from "@/lib/api/client";
import type { PromotionBannerRead } from "@/lib/api/promotion-banners";
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
    <section className="hero-featured relative ml-[calc(50%-50vw)] h-[460px] w-screen max-w-none shrink-0 overflow-hidden">
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
                <Image
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[60%] bg-gradient-to-t from-bg via-bg/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[58%] max-w-[900px] bg-gradient-to-r from-bg/92 via-bg/45 to-transparent" />

      <div className="relative z-[2] h-full">
        <div className="flex h-full w-full items-end px-6 pb-12 md:px-12 md:pb-16">
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
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="h-[1px] w-8 bg-brand" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                      {t("promotionEyebrow")}
                    </span>
                  </div>

                  <h2 className="text-[56px] font-black leading-[0.95] tracking-[-0.035em] text-text">
                    {banner.title}
                  </h2>

                  {banner.subtitle ? (
                    <p className="mt-5 max-w-[440px] text-[14px] leading-[1.65] text-text/80">
                      {banner.subtitle}
                    </p>
                  ) : null}

                  {ctaHref && banner.cta_label ? (
                    <div className="mt-7 flex items-center gap-3">
                      <Link
                        href={ctaHref}
                        className="group inline-flex items-center gap-2 rounded-[6px] bg-brand px-7 py-3 text-[14px] font-bold text-white shadow-[0_4px_24px_-4px_rgba(229,9,20,0.5)] transition-all hover:bg-brand-hover hover:shadow-[0_4px_24px_-4px_rgba(229,9,20,0.7)]"
                      >
                        <PlayCircle size={18} className="fill-white text-brand" />
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
          <div className="absolute bottom-8 right-12 z-[3] flex items-center gap-3">
            <span className="text-[11px] font-medium tabular-nums text-text-muted">
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
                  className={`h-[2px] rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-8 bg-brand"
                      : "w-4 bg-text-muted/30 hover:bg-text-muted/50"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
