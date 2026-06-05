"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, Heart, ShoppingBag } from "lucide-react";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { PageShell } from "@/components/layout/PageShell";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { listFavorites } from "@/lib/api/favorites";
import { listMovies } from "@/lib/api/movies";
import { listOwnedMovies } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/to-poster";
import { useAuth } from "@/hooks/auth/use-auth";
import type { TranslationKey } from "@/lib/i18n";
import type { PosterCardProps } from "@/types/poster-card";

type LibraryTab = "owned" | "favourites";

const tabs: { id: LibraryTab; key: TranslationKey }[] = [
  { id: "owned", key: "libraryOwned" },
  { id: "favourites", key: "libraryFavourites" },
];

export default function MyLibraryPage() {
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

  useEffect(() => {
    if (!loggedIn) {
      router.replace(`/login?next=${encodeURIComponent("/my-library")}`);
      return;
    }

    let cancelled = false;
    setLoadError(null);

    (async () => {
      const [ownedMovies, catalogMovies, favorites] = await Promise.all([
        listOwnedMovies().catch(() => []),
        listMovies().catch(() => []),
        listFavorites().catch(() => []),
      ]);

      if (cancelled) return;

      const purchasedIds = new Set(ownedMovies.map((m) => m.id));
      setOwnedCount(ownedMovies.length);
      setOwnedPosters(ownedMovies.map((m, i) => movieToPoster(m, i, purchasedIds)));

      const favIds = new Set(favorites.map((f) => f.content_id));
      setFavoriteCount(favIds.size);
      const favMovies = catalogMovies.filter((m) => favIds.has(m.id));
      setFavoritePosters(favMovies.map((m, i) => movieToPoster(m, i, purchasedIds)));

      if (ownedMovies.length === 0 && favorites.length === 0) {
        setLoadError(null);
      }
    })().catch(() => {
      if (!cancelled) setLoadError("Could not load your library. Please try again.");
    });

    return () => {
      cancelled = true;
    };
  }, [router, loggedIn, favoriteIds]);

  const stat = (key: TranslationKey, count: number) =>
    t(key).replace("{count}", String(count));

  return (
    <PageShell wide>
      <div className="px-6 pb-4 pt-7 md:px-8">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          <Bookmark size={13} /> {t("libraryBadge")}
        </div>
        <h1 className={pageTitleClassName}>{t("libraryTitle")}</h1>
      </div>

      {loadError ? (
        <div className="mx-6 mb-4 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning md:mx-8">
          {loadError}
        </div>
      ) : null}

      <div className="border-b border-border px-6 pb-5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <ShoppingBag size={13} className="text-warning" />
            <span className="text-text-muted">{stat("libraryStatOwned", ownedCount)}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <CheckCircle2 size={13} className="text-success" />
            <span className="text-text-muted">{stat("libraryStatSubscribed", 0)}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <Heart size={13} className="text-brand" />
            <span className="text-text-muted">{stat("libraryStatFavourites", favoriteCount)}</span>
          </div>
        </div>

        <div
          className="-mx-1 mt-4 flex items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label={t("libraryTitle")}
        >
          {tabs.map(({ id, key }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={[
                "shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                activeTab === id
                  ? "bg-surface-elevated text-text"
                  : "text-text-muted hover:bg-surface-elevated hover:text-text",
              ].join(" ")}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "favourites" ? (
        favoritePosters.length > 0 ? (
          <section className="pt-6 pb-12">
            <div className="px-6 md:px-8">
              <SectionHeader title={t("libraryFavourites")} />
            </div>
            <PosterScrollRail posters={favoritePosters} imagePriorityCount={2} />
          </section>
        ) : (
          <section className="pt-6 pb-12">
            <div className="px-6 md:px-8">
              <SectionHeader title={t("libraryFavourites")} />
              <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-dashed border-border py-10 text-center">
                <Heart size={24} className="text-border-hover" />
                <div className="mt-3 text-[13px] font-semibold text-text-muted">
                  {t("libraryEmptyFavouritesTitle")}
                </div>
                <div className="mt-1 text-[12px] text-text-disabled">
                  {t("libraryEmptyFavouritesDesc")}
                </div>
                <a
                  href="/movies"
                  className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
                >
                  {t("libraryBrowseMovies")}
                </a>
              </div>
            </div>
          </section>
        )
      ) : ownedPosters.length > 0 ? (
        <section className="pt-6 pb-12">
          <div className="px-6 md:px-8">
            <SectionHeader title={t("libraryOwned")} showSeeAll />
          </div>
          <PosterScrollRail posters={ownedPosters} />
        </section>
      ) : (
        <section className="pt-6 pb-12">
          <div className="px-6 md:px-8">
            <SectionHeader title={t("libraryOwned")} />
            <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-dashed border-border py-10 text-center">
              <ShoppingBag size={24} className="text-border-hover" />
              <div className="mt-3 text-[13px] font-semibold text-text-muted">
                {t("libraryEmptyOwnedTitle")}
              </div>
              <div className="mt-1 text-[12px] text-text-disabled">{t("libraryEmptyOwnedDesc")}</div>
              <a
                href="/movies"
                className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
              >
                {t("libraryBrowseMovies")}
              </a>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
