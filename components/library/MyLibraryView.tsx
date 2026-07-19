"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CSSProperties, ElementType } from "react";
import { CheckCircle2, Clock, Heart, ShoppingBag } from "lucide-react";
import { PosterCard } from "@/components/catalog/PosterCard";
import { PageShell } from "@/components/layout/PageShell";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useI18n } from "@/components/providers/LocaleProvider";
import { listFavorites } from "@/lib/api/favorites";
import { listOwnedMovies } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/mappers";
import { useAuth } from "@/hooks/auth/use-auth";
import { swallow } from "@/lib/log";
import type { TranslationKey } from "@/lib/i18n";
import type { ContentListItemRead } from "@/lib/api/types";
import type { PosterCardProps } from "@/types/poster-card";

type LibraryTab = "owned" | "favourites" | "watchlist";

const tabs: { id: LibraryTab; labelKey: TranslationKey; icon: ElementType }[] = [
  { id: "owned", labelKey: "libraryOwned", icon: ShoppingBag },
  { id: "favourites", labelKey: "libraryFavourites", icon: Heart },
  { id: "watchlist", labelKey: "libraryWatchlist", icon: Clock },
];

function StatCard({
  icon: Icon,
  count,
  label,
  accentClass,
}: {
  icon: ElementType;
  count: number;
  label: string;
  accentClass: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl border border-border bg-surface px-3 py-3 sm:px-4 sm:py-4">
      <div className={["flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest", accentClass].join(" ")}>
        <Icon size={11} strokeWidth={2.5} aria-hidden />
        <span className="truncate">{label}</span>
      </div>
      <p className="text-[22px] sm:text-[28px] font-black tabular-nums leading-none text-text">{count}</p>
    </div>
  );
}

const EMPTY_CONTENT: Record<
  LibraryTab,
  { Icon: ElementType; heading: string; body: string; ctaHref: string; cta: string }
> = {
  owned: {
    Icon: ShoppingBag,
    heading: "No owned titles yet",
    body: "Purchase movies to find them here.",
    ctaHref: "/movies",
    cta: "Browse movies",
  },
  favourites: {
    Icon: Heart,
    heading: "No favourites yet",
    body: "Tap the heart on any movie to save it here.",
    ctaHref: "/movies",
    cta: "Browse movies",
  },
  watchlist: {
    Icon: Clock,
    heading: "Nothing saved yet",
    body: "Browse movies and series to add to your watchlist.",
    ctaHref: "/movies",
    cta: "Browse titles",
  },
};

function EmptyState({ tab }: { tab: LibraryTab }) {
  const { Icon, heading, body, ctaHref, cta } = EMPTY_CONTENT[tab];
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
        <Icon size={28} className="text-border-hover" aria-hidden />
      </div>
      <h3 className="mt-5 text-[15px] font-bold text-text">{heading}</h3>
      <p className="mt-2 max-w-[24ch] text-[13px] leading-relaxed text-text-muted">{body}</p>
      <a
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        {cta}
      </a>
    </div>
  );
}

type MyLibraryViewProps = {
  /**
   * Public movie catalog, fetched + ISR-cached on the server and passed in.
   * Used to resolve favourite IDs into poster cards without an (uncached,
   * sequential) full-catalog fetch on the client.
   */
  catalogMovies: ContentListItemRead[];
};

export function MyLibraryView({ catalogMovies }: MyLibraryViewProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { favoriteIds } = useFavorites();
  const [activeTab, setActiveTab] = useState<LibraryTab>("owned");
  const [ownedPosters, setOwnedPosters] = useState<PosterCardProps[]>([]);
  const [favoritePosters, setFavoritePosters] = useState<PosterCardProps[]>([]);
  const [ownedCount, setOwnedCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Reset to a fresh loading pass when auth changes (adjust-state-during-render pattern).
  const [prevLoggedIn, setPrevLoggedIn] = useState(loggedIn);
  if (prevLoggedIn !== loggedIn) {
    setPrevLoggedIn(loggedIn);
    setLoadError(null);
    setDataLoading(true);
  }

  useEffect(() => {
    if (!loggedIn) {
      router.replace(`/login?next=${encodeURIComponent("/my-library")}`);
      return;
    }

    let cancelled = false;

    // Only the small, user-specific data is fetched client-side; the public
    // catalog comes from the server (cached) via the `catalogMovies` prop.
    (async () => {
      const [ownedMovies, favorites] = await Promise.all([
        listOwnedMovies().catch(swallow("my-library: load owned movies", [])),
        listFavorites().catch(swallow("my-library: load favorites", [])),
      ]);

      if (cancelled) return;

      const purchasedIds = new Set(ownedMovies.map((m) => m.id));
      setOwnedCount(ownedMovies.length);
      setOwnedPosters(ownedMovies.map((m, i) => movieToPoster(m, i, purchasedIds)));

      const favIds = new Set(favorites.map((f) => f.content_id));
      setFavoriteCount(favIds.size);
      const favMovies = catalogMovies.filter((m) => favIds.has(m.id));
      setFavoritePosters(favMovies.map((m, i) => movieToPoster(m, i, purchasedIds)));

      setLoadError(null);
      setDataLoading(false);
    })().catch(() => {
      if (!cancelled) {
        setLoadError("Could not load your library. Please try again.");
        setDataLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, loggedIn, favoriteIds, catalogMovies]);

  const activePosters =
    activeTab === "owned" ? ownedPosters : activeTab === "favourites" ? favoritePosters : [];
  const activeCount =
    activeTab === "owned" ? ownedCount : activeTab === "favourites" ? favoriteCount : 0;

  return (
    <PageShell wide>
      {/* Error banner */}
      {loadError ? (
        <div className="mx-6 mt-4 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning md:mx-8">
          {loadError}
        </div>
      ) : null}

      {/* Stats + tabs */}
      <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 md:px-8">
        {/* Stat cards */}
        <div
          className="rt-page-fade-up flex gap-3"
          style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
        >
          <StatCard icon={ShoppingBag} count={ownedCount} label="Owned" accentClass="text-warning" />
          <StatCard icon={CheckCircle2} count={0} label="Subscribed" accentClass="text-success" />
          <StatCard icon={Heart} count={favoriteCount} label="Favourites" accentClass="text-brand" />
        </div>

        {/* Tab bar */}
        <div
          className="rt-page-fade-up mt-5 flex items-center gap-2"
          role="tablist"
          aria-label={t("libraryTitle")}
          style={{ "--rt-enter-delay": "175ms" } as CSSProperties}
        >
          {tabs.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={[
                  "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
                  isActive
                    ? "bg-brand text-white shadow-[0_4px_14px_-4px_rgba(229,9,20,0.55)]"
                    : "border border-border bg-surface text-text-muted hover:border-border-hover hover:bg-surface-elevated hover:text-text",
                ].join(" ")}
              >
                <Icon size={14} aria-hidden />
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <section className="px-4 pt-5 pb-12 sm:px-6 sm:pt-6 md:px-8 md:pb-14">
        {/* Section header */}
        <div
          className="rt-page-fade-up mb-5 flex items-center gap-3"
          style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
        >
          <span className="h-5 w-0.75 shrink-0 rounded-full bg-brand" aria-hidden />
          <h2 className="text-[15px] font-bold tracking-tight text-text">
            {activeTab === "owned"
              ? t("libraryOwned")
              : activeTab === "favourites"
                ? t("libraryFavourites")
                : t("libraryWatchlist")}
          </h2>
          {activeCount > 0 && !dataLoading ? (
            <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[11px] font-bold text-text-muted">
              {activeCount}
            </span>
          ) : null}
        </div>

        {/* Grid / skeleton / empty */}
        <div
          className="rt-page-fade-up"
          style={{ "--rt-enter-delay": "295ms" } as CSSProperties}
        >
          {dataLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-2/3 animate-pulse bg-surface-elevated" />
              ))}
            </div>
          ) : activePosters.length > 0 ? (
            <ul className="m-0 list-none p-0 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {activePosters.map((poster, i) => (
                <li key={`${poster.watchHref ?? "no-href"}-${i}`}>
                  <PosterCard {...poster} imagePriority={i < 6} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
