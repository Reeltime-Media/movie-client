import { Layers, Lock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageShell } from "../components/PageShell";
import { PosterCard } from "../components/PosterCard";
import { SectionHeader } from "../components/SectionHeader";

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

      <section className="px-6 pb-7 pt-2 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader title="Series · Subscribe to unlock" />
          <div className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text">
            <Lock size={14} className="text-text-muted" />
            Locked catalog
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PosterCard
            imageSrc="/movie_sample/poster1.png"
            posterTitle="MIDNIGHT RUN"
            titleBelow="Midnight Run"
            posterGradient="linear-gradient(180deg, #0a1f30, #040a14, #000000)"
            accentColor="#5cb8d4"
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Midnight%20Run"
          />
          <PosterCard
            imageSrc="/movie_sample/poster2.png"
            posterTitle="FINAL FRAME"
            titleBelow="Final Frame"
            posterGradient="linear-gradient(180deg, #1a1a08, #404010, #0a0a04)"
            accentColor="#d4cc5c"
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Final%20Frame"
          />
          <PosterCard
            imageSrc="/movie_sample/poster3.png"
            posterTitle="GLASSHOUSE"
            titleBelow="Glasshouse"
            posterGradient="linear-gradient(180deg, #0e3d20, #04140a, #000000)"
            accentColor="#5cd49a"
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Glasshouse"
          />
          <PosterCard
            imageSrc="/movie_sample/poster4.png"
            posterTitle="HOLLOW COAST"
            titleBelow="Hollow Coast"
            posterGradient="linear-gradient(180deg, #1a0e08, #421a08, #0a0604)"
            accentColor="#e8965c"
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Hollow%20Coast"
          />
        </div>
      </section>

      <section className="px-6 pb-10 pt-3 md:px-8">
        <SectionHeader title="Popular series" showSeeAll />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PosterCard
            imageSrc="/movie_sample/poster4.png"
            posterTitle="ECHO VALLEY"
            titleBelow="Echo Valley"
            posterGradient="linear-gradient(180deg, #14101a, #2c1a3d, #0c0612)"
            accentColor="#b08fd9"
            subtitle={{ text: "A SERIES", color: "#b08fd9" }}
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Echo%20Valley"
          />
          <PosterCard
            imageSrc="/movie_sample/poster5.png"
            posterTitle="NEON QUARTER"
            titleBelow="Neon Quarter"
            posterGradient="linear-gradient(170deg, #12061a, #3b0f4a, #0a040a)"
            accentColor="#ed7aa6"
            subtitle={{ text: "A SERIES", color: "#ed7aa6" }}
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Neon%20Quarter"
          />
          <PosterCard
            imageSrc="/movie_sample/poster1.png"
            posterTitle="DUST & TIDE"
            titleBelow="Dust & Tide"
            posterGradient="linear-gradient(165deg, #07140d, #123d20, #020a06)"
            accentColor="#5cd49a"
            subtitle={{ text: "A SERIES", color: "#5cd49a" }}
            watchLabel="Watch"
            watchHref="/pay/subscription?title=Dust%20%26%20Tide"
          />
          <PosterCard
            imageSrc="/movie_sample/poster2.png"
            posterTitle="CITY LOOM"
            titleBelow="City Loom"
            posterGradient="linear-gradient(165deg, #0a0f18, #1b2c55, #05070f)"
            accentColor="#7c8bff"
            subtitle={{ text: "A SERIES", color: "#7c8bff" }}
            watchLabel="Watch"
            watchHref="/pay/subscription?title=City%20Loom"
          />
        </div>
      </section>
    </PageShell>
  );
}

