"use client";

import { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, Clock3, Heart, ShoppingBag } from "lucide-react";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { listMovies } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { movieToPoster } from "@/lib/api/to-poster";
import { isLoggedIn } from "@/lib/api/client";
import type { PosterCardProps } from "@/app/components/PosterCard";

const filters = ["All", "Continue watching", "Owned", "Subscribed", "Watchlist"];

export default function MyLibraryPage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [ownedPosters, setOwnedPosters] = useState<PosterCardProps[]>([]);
  const [continuePosters, setContinuePosters] = useState<PosterCardProps[]>([]);
  const [ownedCount, setOwnedCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) return;
    Promise.all([listMovies(), listPurchases()])
      .then(([movies, purchases]) => {
        const purchasedIds = new Set(purchases.map((p) => p.content_id));
        const purchasedMovies = movies.filter((m) => purchasedIds.has(m.id));
        setOwnedCount(purchasedMovies.length);
        const owned = purchasedMovies.map((m, i) => movieToPoster(m, i, purchasedIds));
        setOwnedPosters(owned);
        setContinuePosters(owned.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <PageShell wide>
      <div className="px-6 pb-4 pt-7 md:px-8">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          <Bookmark size={13} /> My Library
        </div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Your collection</h1>
      </div>

      <div className="border-b border-border px-6 pb-5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <ShoppingBag size={13} className="text-warning" />
            <span className="text-text-muted">{ownedCount} Owned</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <CheckCircle2 size={13} className="text-success" />
            <span className="text-text-muted">0 Subscribed</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <Clock3 size={13} className="text-text-muted" />
            <span className="text-text-muted">{continuePosters.length} In progress</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            <Heart size={13} className="text-brand" />
            <span className="text-text-muted">0 Watchlist</span>
          </div>
        </div>

        <div
          className="-mx-1 mt-4 flex items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {filters.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(i)}
              className={[
                "shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                i === activeFilter
                  ? "bg-surface-elevated text-text"
                  : "text-text-muted hover:bg-surface-elevated hover:text-text",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {continuePosters.length > 0 && (
        <section className="pt-6 pb-8">
          <div className="px-6 md:px-8">
            <SectionHeader title="Continue watching" />
          </div>
          <PosterScrollRail posters={continuePosters} imagePriorityCount={2} />
        </section>
      )}

      {ownedPosters.length > 0 ? (
        <section className="pt-2 pb-8">
          <div className="px-6 md:px-8">
            <SectionHeader title="Owned" showSeeAll />
          </div>
          <PosterScrollRail posters={ownedPosters} />
        </section>
      ) : (
        <section className="pt-6 pb-8">
          <div className="px-6 md:px-8">
            <SectionHeader title="Owned" />
            <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-dashed border-border py-10 text-center">
              <ShoppingBag size={24} className="text-border-hover" />
              <div className="mt-3 text-[13px] font-semibold text-text-muted">No owned titles yet</div>
              <div className="mt-1 text-[12px] text-text-disabled">
                Purchase movies to find them here.
              </div>
              <a
                href="/movies"
                className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
              >
                Browse movies
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="pt-2 pb-12">
        <div className="px-6 md:px-8">
          <SectionHeader title="Watchlist" />
          <div className="mt-4 flex flex-col items-center justify-center rounded-md border border-dashed border-border py-10 text-center">
            <Heart size={24} className="text-border-hover" />
            <div className="mt-3 text-[13px] font-semibold text-text-muted">Nothing saved yet</div>
            <div className="mt-1 text-[12px] text-text-disabled">
              Browse movies and series to add to your watchlist.
            </div>
            <a
              href="/"
              className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
            >
              Browse titles
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
