"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Clapperboard } from "lucide-react";

import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { marketingImages } from "@/lib/marketing-images";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { kickerBadgeClassName, primaryButtonClassName } from "@/lib/ui/surfaces";

export default function ShortMoviesPage() {
  const { t } = useI18n();

  return (
    <PageShell wide>
      <CinematicDecor
        imageSrc={marketingImages.filmProjector}
        imageDescription="Vintage film projector in a dark theater"
        showBrandGlow
        minHeightClass="min-h-[200px] sm:min-h-[240px]"
        viewportBleed
      >
        <div className="max-w-2xl">
          <span
            className={["rt-page-fade-up mb-3 inline-flex", kickerBadgeClassName].join(" ")}
            style={{ "--rt-enter-delay": "40ms" } as CSSProperties}
          >
            <Clapperboard size={12} aria-hidden />
            {t("shortMoviesBadge")}
          </span>
          <h1
            className={["rt-page-fade-up", pageTitleOnHeroClassName].join(" ")}
            style={{ "--rt-enter-delay": "80ms" } as CSSProperties}
          >
            {t("shortMoviesTitle")}
          </h1>
        </div>
      </CinematicDecor>

      <section
        className="rt-page-fade-up px-6 pb-16 pt-10 md:px-8"
        style={{ "--rt-enter-delay": "180ms" } as CSSProperties}
      >
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[14px] leading-relaxed text-text-muted">{t("shortMoviesDesc")}</p>
          <Link href="/movies" className={[primaryButtonClassName, "mt-8 max-w-xs"].join(" ")}>
            {t("shortMoviesBrowseMovies")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
