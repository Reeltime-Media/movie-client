import { Bookmark, Clock3, Download } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageShell } from "../components/PageShell";
import { PosterCard } from "../components/PosterCard";
import { SectionHeader } from "../components/SectionHeader";

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

      <section className="px-6 pb-7 pt-2 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PosterCard
            imageSrc="/movie_sample/poster3.png"
            posterTitle="CROWN OF ASH"
            titleBelow="Crown of Ash"
            posterGradient="linear-gradient(140deg, #1c0d05, #3d1e08, #0f0703)"
            accentColor="#d4a04a"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "continue", value: "Continue · 42m left" }}
            watchHref="/watch?title=Crown%20of%20Ash"
          />
          <PosterCard
            imageSrc="/movie_sample/poster4.png"
            posterTitle="ECHO VALLEY"
            titleBelow="Echo Valley"
            posterGradient="linear-gradient(180deg, #14101a, #2c1a3d, #0c0612)"
            accentColor="#b08fd9"
            subtitle={{ text: "A SERIES", color: "#b08fd9" }}
            entitlement={{ kind: "none" }}
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Echo%20Valley"
          />
          <PosterCard
            imageSrc="/movie_sample/poster2.png"
            posterTitle="THE LAST DRIVE"
            titleBelow="The Last Drive"
            posterGradient="linear-gradient(155deg, #2a0c10, #6b1419, #0f0608)"
            accentColor="#E50914"
            badge={{ kind: "hd", label: "HD" }}
            entitlement={{ kind: "price", value: "$2.99" }}
            watchHref="/pay/movie?title=The%20Last%20Drive&price=%242.99"
          />
          <PosterCard
            imageSrc="/movie_sample/poster5.png"
            posterTitle="AFTER HOURS"
            titleBelow="After Hours"
            posterGradient="linear-gradient(165deg, #1a0a18, #4a1538, #0a040a)"
            accentColor="#ed7aa6"
            entitlement={{ kind: "price", value: "$3.99" }}
            watchHref="/pay/movie?title=After%20Hours&price=%243.99"
          />
        </div>
      </section>

      <section className="px-6 pb-10 pt-3 md:px-8">
        <SectionHeader title="Owned" showSeeAll />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PosterCard
            imageSrc="/movie_sample/poster3.png"
            posterTitle="CROWN OF ASH"
            titleBelow="Crown of Ash"
            posterGradient="linear-gradient(140deg, #1c0d05, #3d1e08, #0f0703)"
            accentColor="#d4a04a"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "continue", value: "Continue · 42m left" }}
            watchHref="/watch?title=Crown%20of%20Ash"
          />
          <PosterCard
            imageSrc="/movie_sample/poster1.png"
            posterTitle="SILENT ALLEY"
            titleBelow="Silent Alley"
            posterGradient="linear-gradient(155deg, #0a0f1f, #141a3d, #06070f)"
            accentColor="#7c8bff"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "none" }}
            watchHref="/watch?title=Silent%20Alley"
          />
          <PosterCard
            imageSrc="/movie_sample/poster4.png"
            posterTitle="NIGHT FERRY"
            titleBelow="Night Ferry"
            posterGradient="linear-gradient(155deg, #0a1a18, #0f3a33, #04110f)"
            accentColor="#5cd49a"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "none" }}
            watchHref="/watch?title=Night%20Ferry"
          />
          <PosterCard
            imageSrc="/movie_sample/poster2.png"
            posterTitle="FINAL TURN"
            titleBelow="Final Turn"
            posterGradient="linear-gradient(160deg, #1c1206, #3d2708, #0f0a03)"
            accentColor="#f59e0b"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "none" }}
            watchHref="/watch?title=Final%20Turn"
          />
        </div>
      </section>
    </PageShell>
  );
}

