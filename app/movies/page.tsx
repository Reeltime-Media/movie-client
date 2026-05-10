import { Film, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import {
  moviesActionPosters,
  moviesTrendingPosters,
} from "../mock/posters";

export default function MoviesPage() {
  return (
    <PageShell wide>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Film size={14} /> MOVIES
          </span>
        }
        title="New releases and hits"
        description="Browse action, thriller, and late-night favorites. UI only — connect your backend later."
      />

      <div className="border-b border-border px-6 pb-5 pt-1 md:px-8">
        <PageSearchBar
          label="Search movies"
          placeholder="Search movies by title or genre"
        />
      </div>

      <section className="pb-7 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 md:px-8">
          <SectionHeader title="Trending movies" showSeeAll />
          <div className="hidden items-center gap-2 md:flex">
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted">
              <Sparkles size={14} />
              Curated picks
            </div>
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted">
              <TrendingUp size={14} />
              Most watched
            </div>
          </div>
        </div>

        <PosterScrollRail posters={moviesTrendingPosters} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader title="Action picks" />
        </div>
        <PosterScrollRail posters={moviesActionPosters} />
      </section>
    </PageShell>
  );
}
