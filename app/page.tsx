import { Hero } from "./components/Hero";
import { PageShell } from "./components/PageShell";
import { PosterCard } from "./components/PosterCard";
import { SectionHeader } from "./components/SectionHeader";

export default function Home() {
  return (
    <PageShell wide>
      <Hero />

      <section className="px-6 pb-7 pt-6 md:px-8">
        <SectionHeader title="Trending now" showSeeAll />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PosterCard
            imageSrc="/movie_sample/poster2.png"
            imagePriority
            posterTitle="THE LAST DRIVE"
            titleBelow="The Last Drive"
            posterGradient="linear-gradient(155deg, #2a0c10, #6b1419, #0f0608)"
            accentColor="#E50914"
            badge={{ kind: "hd", label: "HD" }}
            entitlement={{ kind: "price", value: "$2.99" }}
            watchHref="/pay/movie?title=The%20Last%20Drive&price=%242.99"
          />
          <PosterCard
            imageSrc="/movie_sample/poster4.png"
            imagePriority
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
            imageSrc="/movie_sample/poster3.png"
            imagePriority
            posterTitle="CROWN OF ASH"
            titleBelow="Crown of Ash"
            posterGradient="linear-gradient(140deg, #1c0d05, #3d1e08, #0f0703)"
            accentColor="#d4a04a"
            badge={{ kind: "owned", label: "OWNED" }}
            entitlement={{ kind: "continue", value: "Continue · 42m left" }}
            watchHref="/watch?title=Crown%20of%20Ash"
          />
          <PosterCard
            imageSrc="/movie_sample/poster5.png"
            imagePriority
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
        <SectionHeader title="Series · Subscribe to unlock" />
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
    </PageShell>
  );
}
