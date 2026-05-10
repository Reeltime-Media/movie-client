import { Layers, Lock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import {
  seriesPopularPosters,
  seriesSubscribePosters,
} from "../mock/posters";

export default function SeriesPage() {
  return (
    <PageShell wide>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Layers size={14} /> SERIES
          </span>
        }
        title="Subscribe to unlock full seasons"
        description="Series require an active subscription. This is UI only — connect your backend later."
      />

      <div className="border-b border-border px-6 pb-5 pt-1 md:px-8">
        <PageSearchBar
          label="Search series"
          placeholder="Search series by title or genre"
        />
      </div>

      <section className="pb-7 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 md:px-8">
          <SectionHeader title="Series · Subscribe to unlock" />
          <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text">
            <Lock size={14} className="text-text-muted" />
            Locked catalog
          </div>
        </div>

        <PosterScrollRail posters={seriesSubscribePosters} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader title="Popular series" showSeeAll />
        </div>
        <PosterScrollRail posters={seriesPopularPosters} />
      </section>
    </PageShell>
  );
}
