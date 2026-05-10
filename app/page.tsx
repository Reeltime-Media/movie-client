import { Hero } from "./components/Hero";
import { PageShell } from "./components/PageShell";
import { PosterScrollRail } from "./components/PosterScrollRail";
import { SectionHeader } from "./components/SectionHeader";
import {
  homeContinueWatchingPosters,
  homeLateNightThrillersPosters,
  homeLibrarySpotlightPosters,
  homeSubscribeRailPosters,
  homeTrendingPosters,
} from "./mock/posters";

export default function Home() {
  return (
    <PageShell wide>
      <Hero />

      <section className="pb-7 pt-6">
        <div className="px-6 md:px-8">
          <SectionHeader title="Trending now" showSeeAll seeAllHref="/movies" />
        </div>
        <PosterScrollRail posters={homeTrendingPosters} imagePriorityCount={2} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader
            title="Series · Subscribe to unlock"
            showSeeAll
            seeAllHref="/series"
          />
        </div>
        <PosterScrollRail posters={homeSubscribeRailPosters} imagePriorityCount={2} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader
            title="Continue watching"
            showSeeAll
            seeAllHref="/my-library"
          />
        </div>
        <PosterScrollRail posters={homeContinueWatchingPosters} />
      </section>

      <section className="pb-10 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader title="Late-night thrillers" showSeeAll seeAllHref="/movies" />
        </div>
        <PosterScrollRail posters={homeLateNightThrillersPosters} />
      </section>

      <section className="pb-12 pt-3">
        <div className="px-6 md:px-8">
          <SectionHeader
            title="Library spotlight"
            showSeeAll
            seeAllHref="/my-library"
          />
        </div>
        <PosterScrollRail posters={homeLibrarySpotlightPosters} />
      </section>
    </PageShell>
  );
}
