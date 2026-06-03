"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PageSearchBar } from "@/components/catalog/PageSearchBar";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { listMovies } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { listSeries } from "@/lib/api/series";
import { mapSeriesListToPosters } from "@/lib/api/series-posters";
import { movieToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import type { PosterCardProps } from "@/types/poster-card";

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const urlQuery = params.get("q") ?? "";
  const [input, setInput] = useState(urlQuery);
  const [loading, setLoading] = useState(false);
  const [moviePosters, setMoviePosters] = useState<PosterCardProps[]>([]);
  const [seriesPosters, setSeriesPosters] = useState<PosterCardProps[]>([]);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const q = urlQuery.trim();
    if (!q) {
      setMoviePosters([]);
      setSeriesPosters([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([
      listMovies({ search: q }),
      listSeries({ search: q }),
      purchasesPromise,
    ])
      .then(async ([movies, seriesList, purchases]) => {
        if (cancelled) return;
        const ownedIds = new Set(purchases.map((p) => p.content_id));
        setMoviePosters(movies.map((m, i) => movieToPoster(m, i, ownedIds)));
        setSeriesPosters(await mapSeriesListToPosters(seriesList, false));
      })
      .catch(() => {
        if (!cancelled) {
          setMoviePosters([]);
          setSeriesPosters([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlQuery, loggedIn]);

  const hasQuery = urlQuery.trim().length > 0;
  const totalResults = moviePosters.length + seriesPosters.length;

  const submitSearch = useCallback(() => {
    const next = input.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }, [input, router]);

  return (
    <PageShell wide>
      <div className="border-b border-border px-6 py-7 md:px-8">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          <Search size={13} aria-hidden />
          {t("searchPageTitle")}
        </div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">{t("searchPageTitle")}</h1>
        <div className="mt-4 max-w-2xl">
          <PageSearchBar
            label={t("searchPageTitle")}
            placeholder={t("searchPlaceholder")}
            value={input}
            onValueChange={setInput}
            onSubmit={submitSearch}
            clearLabel={t("searchClearAria")}
          />
        </div>
      </div>

      <div className="px-6 py-8 md:px-8">
        {!hasQuery ? (
          <p className="text-[13px] text-text-muted">{t("searchNoQuery")}</p>
        ) : loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        ) : totalResults === 0 ? (
          <p className="text-[14px] font-semibold text-text-muted">{t("searchNoResults")}</p>
        ) : (
          <div className="space-y-10">
            {moviePosters.length > 0 ? (
              <section>
                <SectionHeader title={t("searchMoviesSection")} />
                <div className="mt-4">
                  <PosterScrollRail posters={moviePosters} imagePriorityCount={4} />
                </div>
              </section>
            ) : null}
            {seriesPosters.length > 0 ? (
              <section>
                <SectionHeader title={t("searchSeriesSection")} />
                <div className="mt-4">
                  <PosterScrollRail posters={seriesPosters} />
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageShell wide>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        </PageShell>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
