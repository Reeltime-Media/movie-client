"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CdnImage } from "@/components/ui/CdnImage";
import { GenreFilterSelect } from "@/components/catalog/GenreFilterSelect";
import { PageSearchBar } from "@/components/catalog/PageSearchBar";
import { PosterCard } from "@/components/catalog/PosterCard";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { listPurchases } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import {
  collectGenreLabels,
  genreKeyFromLabel,
  matchesGenreLabel,
  matchesSearch,
} from "@/lib/catalog-filter";
import type { PosterCardProps } from "@/types/poster-card";
import type { ContentListItemRead } from "@/lib/api/types";

const COLS = 5;
const ROWS = 4;
const PAGE_SIZE = COLS * ROWS; // 20
const TOP_COUNT = 10;
const ALL_GENRES = "";

type MoviesViewProps = {
  movies: ContentListItemRead[];
  /** Raw genre label from ?genre= (e.g. "Action"), or empty for all. */
  initialGenreLabel?: string;
};

function Top10Sidebar({ posters }: { posters: PosterCardProps[] }) {
  const top10 = posters.slice(0, TOP_COUNT);
  return (
    <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
      <div className="sticky top-4 border border-border bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden />
          <h2 className="text-[15px] font-bold tracking-tight text-text">Top 10 Movies</h2>
        </div>
        <ol className="space-y-1 list-none m-0 p-0">
          {top10.map((p, i) => {
            return (
              <li key={`${p.watchHref}-${i}`}>
                <a
                  href={p.watchHref ?? "#"}
                  className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-surface-elevated"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden bg-surface-elevated">
                    {p.imageSrc ? (
                      <CdnImage
                        src={p.imageSrc}
                        alt={p.titleBelow}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: p.posterGradient }} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-text group-hover:text-brand transition-colors">
                      {p.titleBelow}
                    </p>
                    {p.year ? (
                      <p className="mt-1 text-[12px] text-text-muted">{p.year}</p>
                    ) : null}
                    {p.entitlement?.kind === "price" ? (
                      <p className="mt-1 text-[12px] font-semibold text-brand">{p.entitlement.value}</p>
                    ) : null}
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

export function MoviesView({
  movies,
  initialGenreLabel = ALL_GENRES,
}: MoviesViewProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const [activeGenre, setActiveGenre] = useState(initialGenreLabel);
  const [searchQuery, setSearchQuery] = useState("");
  const [ownedIds, setOwnedIds] = useState<Set<string> | null>(null);
  const [page, setPage] = useState(0);

  // Sync when navigating from a home genre rail (e.g. /movies?genre=Thriller)
  // using the adjust-state-during-render pattern.
  const [prevInitialGenre, setPrevInitialGenre] = useState(initialGenreLabel);
  if (prevInitialGenre !== initialGenreLabel) {
    setPrevInitialGenre(initialGenreLabel);
    setActiveGenre(initialGenreLabel);
    setPage(0);
  }

  const genreOptions = useMemo(() => {
    const labels = collectGenreLabels(movies);
    return [
      { value: ALL_GENRES, label: t("genreAll") },
      ...labels.map((label) => {
        const knownKey = genreKeyFromLabel(label);
        return {
          value: label,
          label: knownKey !== "genreAll" ? t(knownKey) : label,
        };
      }),
    ];
  }, [movies, t]);

  const filteredMovies = useMemo(
    () =>
      movies.filter(
        (m) => matchesSearch(m, searchQuery) && matchesGenreLabel(m, activeGenre || null),
      ),
    [movies, searchQuery, activeGenre],
  );

  const allPosters = useMemo(
    () => filteredMovies.map((m, i) => movieToPoster(m, i, ownedIds ?? undefined, isAdmin)),
    [filteredMovies, ownedIds, isAdmin],
  );

  // Top 10 always uses unfiltered movies
  const top10Posters = useMemo(
    () => movies.slice(0, TOP_COUNT).map((m, i) => movieToPoster(m, i, ownedIds ?? undefined, isAdmin)),
    [movies, ownedIds, isAdmin],
  );

  const totalPages = Math.max(1, Math.ceil(allPosters.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagePosters = allPosters.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const hasActiveFilters = searchQuery.trim().length > 0 || activeGenre !== ALL_GENRES;

  useEffect(() => {
    if (!loggedIn || !movies.length) return;
    let cancelled = false;
    listPurchases()
      .catch(() => [])
      .then((purchases) => {
        if (cancelled) return;
        setOwnedIds(new Set(purchases.map((p) => p.content_id)));
      });
    return () => { cancelled = true; };
  }, [movies, loggedIn]);

  return (
    <PageShell fullWidth>
      <div
        className="relative ml-[calc(50%-50vw)] w-screen max-w-none shrink-0 overflow-hidden border-b border-border min-h-36 sm:min-h-48 md:min-h-60"
        style={{ backgroundImage: "url('/asset/moviebackground_header.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/55 to-transparent" />
        <div className="relative z-1 flex min-h-[inherit] flex-col justify-end px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:pb-10">
          <h1
            className={["rt-page-fade-up max-w-[18ch]", pageTitleOnHeroClassName].join(" ")}
            style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
          >
            {t("moviesTitle")}
          </h1>
        </div>
      </div>

      {/* Search + filter */}
      <div
        className="rt-page-fade-up relative z-10 border-b border-border px-4 py-3 sm:px-6 sm:py-4 md:px-8"
        style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <PageSearchBar
            className="max-w-none min-w-0 flex-1"
            label={t("moviesSearchLabel")}
            placeholder={t("moviesSearchPlaceholder")}
            value={searchQuery}
            onValueChange={(value) => {
              setSearchQuery(value);
              setPage(0);
            }}
          />
          <GenreFilterSelect
            className="w-full sm:w-44"
            label={t("moviesFilterGenre")}
            value={activeGenre}
            onChange={(genre) => {
              setActiveGenre(genre);
              setPage(0);
            }}
            options={genreOptions}
          />
        </div>
      </div>

      {/* Main layout: grid + sidebar */}
      <div className="flex items-start gap-4 px-4 pt-4 pb-8 sm:gap-6 sm:px-6 sm:pt-6 md:px-8">
        {/* Movie grid + pagination */}
        <div
          className="rt-page-fade-up min-w-0 flex-1"
          style={{ "--rt-enter-delay": "320ms" } as CSSProperties}
        >
          {hasActiveFilters && allPosters.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[14px] font-semibold text-text-muted">{t("searchNoResults")}</p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 list-none m-0 p-0">
                {pagePosters.map((poster, i) => (
                  <li key={`${poster.watchHref ?? "no-href"}-${i}`}>
                    <PosterCard {...poster} imagePriority={i < 5} />
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronLeft size={14} aria-hidden /> Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => {
                      const isActive = i === safePage;
                      const isNearby = Math.abs(i - safePage) <= 2;
                      const isEdge = i === 0 || i === totalPages - 1;
                      if (!isNearby && !isEdge) {
                        return (i === 1 || i === totalPages - 2)
                          ? <span key={i} className="px-1 text-[12px] text-text-muted">…</span>
                          : null;
                      }
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className={[
                            "min-w-8 rounded-md px-2.5 py-2 text-[12px] font-semibold transition-colors",
                            isActive
                              ? "bg-brand text-white"
                              : "border border-border bg-surface text-text-muted hover:border-border-hover hover:text-text",
                          ].join(" ")}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage === totalPages - 1}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text disabled:pointer-events-none disabled:opacity-30"
                  >
                    Next <ChevronRight size={14} aria-hidden />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top 10 sidebar */}
        <Top10Sidebar posters={top10Posters} />
      </div>
    </PageShell>
  );
}
