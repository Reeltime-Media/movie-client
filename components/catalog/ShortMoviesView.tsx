"use client";

import type { CSSProperties } from "react";
import { Clapperboard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { PosterCard } from "@/components/catalog/PosterCard";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { seriesToPoster } from "@/lib/api/mappers";
import { listMySubscriptions, hasActiveSubscription } from "@/lib/api/subscriptions";
import type { SeasonRead, SeriesRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { marketingImages } from "@/lib/marketing-images";
import { swallow } from "@/lib/log";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

type ShortMoviesViewProps = {
  seriesList: SeriesRead[];
  seasons: SeasonRead[][];
};

export function ShortMoviesView({ seriesList, seasons }: ShortMoviesViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!loggedIn || !seriesList.length) return;
    let cancelled = false;
    listMySubscriptions()
      .catch(swallow("short-movies: load subscriptions", []))
      .then((subs) => {
        if (cancelled) return;
        setHasSubscription(hasActiveSubscription(subs));
      });
    return () => {
      cancelled = true;
    };
  }, [seriesList, loggedIn]);

  const posters = useMemo(
    () =>
      seriesList.map((s, i) =>
        seriesToPoster(s, i, { hasSubscription, isAdmin, seasons: seasons[i] ?? [] }),
      ),
    [seriesList, seasons, hasSubscription, isAdmin],
  );

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
          <p
            className="rt-page-fade-up mt-3 max-w-lg text-[13px] leading-relaxed text-white/80"
            style={{ "--rt-enter-delay": "120ms" } as CSSProperties}
          >
            {t("shortMoviesDesc")}
          </p>
        </div>
      </CinematicDecor>

      <section
        className="rt-page-fade-up px-4 py-8 sm:px-6 md:px-8"
        style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
      >
        {posters.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-text-muted">{t("shortMoviesEmpty")}</p>
        ) : (
          <ul className="m-0 list-none grid grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {posters.map((poster, i) => (
              <li key={`${poster.watchHref ?? "no-href"}-${i}`}>
                <PosterCard {...poster} imagePriority={i < 5} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
