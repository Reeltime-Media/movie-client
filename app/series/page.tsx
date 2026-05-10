import { Layers, Lock } from "lucide-react";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { seriesPopularPosters, seriesSubscribePosters } from "../mock/posters";

const genres = ["All", "Drama", "Thriller", "Sci-Fi", "Comedy", "Crime", "Action"];

export default function SeriesPage() {
  return (
    <PageShell wide>
      {/* Page title row */}
      <div className="px-6 pb-4 pt-7 md:px-8">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          <Layers size={13} /> Series
        </div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Full seasons, any time</h1>
      </div>

      {/* Genre filter tabs */}
      <div className="border-b border-border px-6 md:px-8">
        <div
          className="-mx-1 flex items-center gap-1 overflow-x-auto pt-1 pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {genres.map((g, i) => (
            <button
              key={g}
              className={[
                "shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                i === 0
                  ? "bg-brand text-white"
                  : "text-text-muted hover:bg-surface-elevated hover:text-text",
              ].join(" ")}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b border-border px-6 py-4 md:px-8">
        <PageSearchBar label="Search series" placeholder="Search series by title or genre" />
      </div>

      {/* Subscription upsell banner */}
      <div className="mx-6 mt-6 overflow-hidden rounded-md border border-border bg-surface-elevated md:mx-8">
        <div className="flex items-stretch">
          {/* Brand accent strip */}
          <div className="w-1 shrink-0 bg-brand" />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand/10">
                <Lock size={16} className="text-brand" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-text">Unlock every series</div>
                <div className="mt-0.5 text-[11px] text-text-muted">
                  Full seasons, no per-title fees. Subscribe for $6.99/mo
                </div>
              </div>
            </div>
            <a
              href="/pay/subscription"
              className="shrink-0 rounded-md bg-brand px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Subscribe
            </a>
          </div>
        </div>
      </div>

      {/* Subscribe to unlock rail */}
      <section className="pt-6 pb-8">
        <div className="px-6 md:px-8">
          <SectionHeader title="Series · Subscribe to unlock" />
        </div>
        <PosterScrollRail posters={seriesSubscribePosters} imagePriorityCount={2} />
      </section>

      {/* Popular right now rail */}
      <section className="pt-2 pb-12">
        <div className="px-6 md:px-8">
          <SectionHeader title="Popular right now" showSeeAll />
        </div>
        <PosterScrollRail posters={seriesPopularPosters} />
      </section>
    </PageShell>
  );
}
