"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { CdnImage } from "@/components/ui/CdnImage";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterUrl } from "@/lib/api/core/config";
import type { ComingSoonItemRead } from "@/lib/api/types";

/** Dark burgundy card body — the red only reads through the neon lighting, not a flat fill. */
const cardBodyStyle: CSSProperties = {
  background: "#4a0d0d",
};

/** Layer 1 (hot core) is a real border; layers 2-4 (orange / red / ambient bloom) are box-shadow. */
const neonBorderClassName = "border border-[#ffe9c2]";
const neonGlowClassName =
  "shadow-[0_0_5px_1px_#ff8a00,0_0_12px_3px_#ff2d16,0_0_24px_6px_rgba(255,50,20,0.45),0_0_38px_10px_rgba(255,30,20,0.2)]";
const neonGlowHoverClassName =
  "hover:shadow-[0_0_7px_2px_#ff9a1a,0_0_16px_4px_#ff3b1a,0_0_30px_8px_rgba(255,50,20,0.55),0_0_48px_13px_rgba(255,30,20,0.26)]";

function formatReleaseDate(releaseAt: string | null, locale: string): string | null {
  if (!releaseAt) return null;
  const date = new Date(releaseAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ComingSoonCard({
  poster,
  title,
  cardLabel,
}: {
  poster?: string;
  title: string;
  cardLabel: string;
}) {
  return (
    <div
      className={[
        "rt-neon-pulse relative flex aspect-[1/1.65] flex-col gap-3 rounded-lg p-1",
        "transition-[transform,box-shadow] duration-300 hover:scale-[1.02]",
        neonBorderClassName,
        neonGlowClassName,
        neonGlowHoverClassName,
      ].join(" ")}
      style={cardBodyStyle}
    >
      <div className="relative flex-1 overflow-hidden rounded-md bg-black">
        {poster ? (
          <CdnImage
            src={poster}
            alt={title}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 44vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-center rounded-md bg-[#3a0a0a]/70 px-4 py-4">
        <span className="text-[17px] font-extrabold uppercase tracking-wide text-white md:text-[19px]">
          {cardLabel}
        </span>
      </div>
    </div>
  );
}

export function ComingSoonView({ items }: { items: ComingSoonItemRead[] }) {
  const { t, locale } = useI18n();

  return (
    <PageShell wide>
      <section className="px-6 pb-28 pt-20 md:px-8">
        {/* Supplied light-streak artwork framing the title. */}
        <div
          className="rt-page-fade-up mb-20 flex flex-col items-center"
          style={{ "--rt-enter-delay": "40ms" } as CSSProperties}
        >
          <Image
            src="/asset/image 20.png"
            alt=""
            width={974}
            height={118}
            aria-hidden
            className="h-auto w-full max-w-4xl"
          />
          <h1 className="text-center text-[34px] font-extrabold uppercase tracking-[-0.02em] text-white md:text-[48px]">
            {t("comingSoonPageTitle")}
          </h1>
          <Image
            src="/asset/image 21.png"
            alt=""
            width={974}
            height={118}
            aria-hidden
            className="h-auto w-full max-w-4xl"
          />
        </div>

        {items.length === 0 ? (
          <p className="mx-auto max-w-md text-center text-[14px] text-text-muted">
            {t("comingSoonEmpty")}
          </p>
        ) : (
          <div className="relative">
            {/* Subtle ambient glow behind the whole grid. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[36rem] max-w-4xl rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(150,20,50,0.22) 0%, rgba(110,15,60,0.1) 45%, transparent 75%)",
              }}
            />

            <div className="relative z-[1] mx-auto grid max-w-5xl grid-cols-1 gap-x-16 gap-y-24 sm:grid-cols-2 sm:gap-x-20 lg:grid-cols-3 lg:gap-x-24">
              {items.map((item, index) => {
                const poster = posterUrl(item.poster_key) ?? posterUrl(item.banner_key);
                const releaseLabel = formatReleaseDate(item.release_at, locale);

                return (
                  <div
                    key={item.id}
                    className="rt-page-fade-up"
                    style={{ "--rt-enter-delay": `${80 + index * 40}ms` } as CSSProperties}
                  >
                    <ComingSoonCard
                      poster={poster}
                      title={item.title}
                      cardLabel={t("comingSoonCardLabel")}
                    />
                    <div className="mt-3 text-center">
                      {item.title_km?.trim() ? (
                        <p className="text-[12px] text-text-muted">{item.title_km}</p>
                      ) : null}
                      <p className="text-[13px] font-semibold text-text">{item.title}</p>
                      {releaseLabel ? (
                        <p className="mt-0.5 text-[11px] font-medium text-text-muted">
                          {releaseLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
