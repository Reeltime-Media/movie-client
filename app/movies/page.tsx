import { Film, PlayCircle, Sparkles, Star, TrendingUp } from "lucide-react";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { moviesActionPosters, moviesTrendingPosters } from "../mock/posters";

const genres = ["All", "Action", "Thriller", "Drama", "Sci-Fi", "Horror", "Comedy"];

export default function MoviesPage() {
  return (
    <PageShell wide>
      {/* Page title row */}
      <div className="flex items-end justify-between px-6 pb-4 pt-7 md:px-8">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            <Film size={13} /> Movies
          </div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Browse all movies</h1>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-border-hover hover:text-text">
            <Sparkles size={13} /> Curated
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-border-hover hover:text-text">
            <TrendingUp size={13} /> Most watched
          </button>
        </div>
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
        <PageSearchBar label="Search movies" placeholder="Search movies by title or genre" />
      </div>

      {/* Staff Pick spotlight banner */}
      <div className="mx-6 mt-6 overflow-hidden rounded-md border border-border bg-surface-elevated md:mx-8">
        <div className="flex items-stretch">
          {/* Brand accent strip */}
          <div className="w-1 shrink-0 bg-brand" />
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <div className="mb-1.5 inline-block rounded-sm bg-brand px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white">
                STAFF PICK
              </div>
              <div className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-text">
                The Last Drive
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
                <Star size={11} className="fill-warning text-warning" />
                <span>8.7</span>
                <span className="text-border-hover">·</span>
                <span>2026</span>
                <span className="text-border-hover">·</span>
                <span>Action · Thriller</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/pay/movie?title=The%20Last%20Drive&price=%242.99"
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                <PlayCircle size={14} /> Buy · $2.99
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trending section */}
      <section className="pt-6 pb-8">
        <div className="px-6 md:px-8">
          <SectionHeader title="Trending now" showSeeAll />
        </div>
        <PosterScrollRail posters={moviesTrendingPosters} imagePriorityCount={2} />
      </section>

      {/* Action picks section */}
      <section className="pt-2 pb-12">
        <div className="px-6 md:px-8">
          <SectionHeader title="Action picks" showSeeAll />
        </div>
        <PosterScrollRail posters={moviesActionPosters} />
      </section>
    </PageShell>
  );
}
