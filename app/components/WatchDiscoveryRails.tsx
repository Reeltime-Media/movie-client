import { PosterScrollRail } from "./PosterScrollRail";
import { SectionHeader } from "./SectionHeader";
import {
  watchMoreLikeThisPosters,
  watchSeriesPicksPosters,
  watchTrendingPosters,
} from "../mock/posters";

export function WatchDiscoveryRails() {
  return (
    <>
      <section className="pb-8 pt-8">
        <div className="px-6 md:px-8">
          <SectionHeader title="More like this" showSeeAll seeAllHref="/movies" />
        </div>
        <PosterScrollRail posters={watchMoreLikeThisPosters} />
      </section>

      <section className="pb-8">
        <div className="px-6 md:px-8">
          <SectionHeader title="Trending now" showSeeAll seeAllHref="/movies" />
        </div>
        <PosterScrollRail posters={watchTrendingPosters} />
      </section>

      <section className="pb-12">
        <div className="px-6 md:px-8">
          <SectionHeader title="Series picks for you" showSeeAll seeAllHref="/series" />
        </div>
        <PosterScrollRail posters={watchSeriesPicksPosters} />
      </section>
    </>
  );
}
