import { Bookmark, Clock3, Download } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import {
  libraryContinuePosters,
  libraryOwnedPosters,
} from "../mock/posters";

export default function MyLibraryPage() {
  return (
    <PageShell wide>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Bookmark size={14} /> MY LIBRARY
          </span>
        }
        title="Owned, subscribed, and in progress"
        description="UI-only library view. It groups items like Continue watching and Owned."
      />

      <div className="border-b border-border px-6 pb-5 pt-1 md:px-8">
        <PageSearchBar
          label="Search your library"
          placeholder="Search titles in your library"
        />
      </div>

      <section className="pb-7 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 md:px-8">
          <SectionHeader title="Continue watching" />
          <div className="hidden items-center gap-2 md:flex">
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted">
              <Clock3 size={14} />
              Continue
            </div>
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-medium text-text-muted">
              <Download size={14} />
              Downloads
            </div>
          </div>
        </div>

        <PosterScrollRail posters={libraryContinuePosters} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader title="Owned" showSeeAll />
        </div>
        <PosterScrollRail posters={libraryOwnedPosters} />
      </section>
    </PageShell>
  );
}
