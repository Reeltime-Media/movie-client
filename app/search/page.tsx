"use client";

import { Play, Search } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PageSearchBar } from "@/components/catalog/PageSearchBar";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterUrl } from "@/lib/api/config";
import { listMovies } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { listEpisodes, listSeries } from "@/lib/api/series";
import { movieCardHref } from "@/lib/movie-routes";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import type { ContentListItemRead, SeasonRead, SeriesRead } from "@/lib/api/types";


function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-brand">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

type SearchResult =
  | { kind: "movie"; data: ContentListItemRead; href: string }
  | { kind: "series"; data: SeriesRead; episodeCount: number };

function ResultRow({ result, query }: { result: SearchResult; query: string }) {
  const imgSrc =
    result.kind === "movie"
      ? posterUrl(result.data.poster_key)
      : posterUrl(result.data.poster_key);

  const title = result.data.title;
  const description = result.data.description;
  const genres = result.data.genres ?? [];

  const subtitle =
    result.kind === "series"
      ? result.episodeCount > 0
        ? `${result.episodeCount} Episodes`
        : "Series"
      : result.data.runtime
        ? result.data.runtime
        : result.data.release_year
          ? String(result.data.release_year)
          : "Movie";

  const href =
    result.kind === "movie"
      ? result.href
      : `/watch/series/${result.data.slug}/1/1`;

  return (
    <div className="flex items-start gap-5 py-6 border-b border-border last:border-0">
      {/* Thumbnail */}
      <a href={href} className="shrink-0">
        <div className="relative h-30 w-22.5 overflow-hidden bg-surface-elevated">
          {imgSrc && (
            <Image src={imgSrc} alt={title} fill sizes="90px" className="object-cover" />
          )}
        </div>
      </a>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <a href={href} className="group block">
          <h3 className="text-[17px] font-bold text-text group-hover:text-brand transition-colors">
            <HighlightedText text={title} query={query} />
          </h3>
        </a>
        <p className="mt-1 text-[12px] font-semibold text-text-muted">{subtitle}</p>
        {description && (
          <p className="mt-2 text-[13px] text-text-muted line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {genres.map((g) => (
              <span
                key={g}
                className="rounded-sm border border-border px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Play button */}
      <a
        href={href}
        className="shrink-0 flex items-center gap-2 bg-brand hover:bg-brand-hover px-5 py-2.5 text-[13px] font-bold text-white transition-colors"
      >
        <Play size={13} fill="white" strokeWidth={0} />
        Play
      </a>
    </div>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const urlQuery = params.get("q") ?? "";
  const [input, setInput] = useState(urlQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const q = urlQuery.trim();
    if (!q) {
      setResults([]);
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

        const episodeCounts = await Promise.all(
          seriesList.map((s) =>
            listEpisodes(s.slug)
              .then((seasons: SeasonRead[]) =>
                seasons.reduce((sum, season) => sum + season.episodes.length, 0),
              )
              .catch(() => 0),
          ),
        );

        const movieResults: SearchResult[] = movies.map((m, i) => {
          const isFree = !m.price_usd || parseFloat(m.price_usd) === 0;
          const isOwned = isFree || ownedIds.has(m.id);
          return {
            kind: "movie",
            data: m,
            href: movieCardHref(m, Boolean(isOwned), isAdmin),
          };
        });

        const seriesResults: SearchResult[] = seriesList.map((s, i) => ({
          kind: "series",
          data: s,
          episodeCount: episodeCounts[i],
        }));

        if (!cancelled) setResults([...movieResults, ...seriesResults]);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlQuery, loggedIn, isAdmin]);

  const submitSearch = useCallback(() => {
    const next = input.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }, [input, router]);

  const hasQuery = urlQuery.trim().length > 0;

  return (
    <PageShell wide>
      {/* Search bar header */}
      <div className="border-b border-border px-6 py-6 md:px-8">
        <div className="max-w-2xl">
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

      <div className="px-6 py-6 md:px-8">
        {!hasQuery ? (
          <p className="text-[13px] text-text-muted">{t("searchNoQuery")}</p>
        ) : loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        ) : results.length === 0 ? (
          <p className="text-[14px] font-semibold text-text-muted">{t("searchNoResults")}</p>
        ) : (
          <>
            {/* Results count */}
            <p className="mb-4 text-[14px] text-text-muted">
              <span className="font-bold text-brand">{results.length}</span>{" "}
              results were found for{" "}
              <span className="font-bold text-brand">{urlQuery}</span>
            </p>
            <div className="border-t border-border">
              {results.map((result) => (
                <ResultRow
                  key={result.data.id}
                  result={result}
                  query={urlQuery}
                />
              ))}
            </div>
          </>
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
