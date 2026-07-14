import { HomeView } from "@/components/home/HomeView";
import { listFreeToday } from "@/lib/api/free-today";
import { listHeroFeatured } from "@/lib/api/hero-featured";
import { listMovies } from "@/lib/api/movies";
import { listPromotionBanners } from "@/lib/api/promotion-banners";
import { listSeries, listEpisodes } from "@/lib/api/series";
import { movieToPoster, seriesToPoster } from "@/lib/api/to-poster";
import type { SeasonRead } from "@/lib/api/types";
import { swallow } from "@/lib/log";

/** Cap episode prefetch — each series was a separate API + DB round-trip. */
const SERIES_EPISODE_PREFETCH_LIMIT = 12;

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function Home() {
  const [movies, seriesList, promotionBanners, heroFeatured, freeToday] = await Promise.all([
    listMovies().catch(swallow("home: load movies", [])),
    listSeries().catch(swallow("home: load series", [])),
    listPromotionBanners("home").catch(swallow("home: load promotion banners", [])),
    listHeroFeatured("home").catch(swallow("home: load hero featured", [])),
    listFreeToday().catch(swallow("home: load free today", [])),
  ]);

  const seasons = await Promise.all(
    seriesList.map((s, index) =>
      index < SERIES_EPISODE_PREFETCH_LIMIT
        ? listEpisodes(s.slug).catch(() => [] as SeasonRead[])
        : Promise.resolve([] as SeasonRead[]),
    ),
  );

  // Public (signed-out) posters, rendered into the initial HTML for a fast LCP.
  // HomeView re-derives entitlement badges client-side once the user is known.
  const initialTrending = movies.map((m, i) => movieToPoster(m, i, new Set<string>()));
  // Everything in this rail is free while listed — FREE badge, no price.
  const initialFreeToday = freeToday.map((m, i) => ({
    ...movieToPoster(m, i, new Set<string>()),
    badge: { kind: "free", label: "FREE" } as const,
    entitlement: { kind: "none" } as const,
    watchHref: `/watch?slug=${m.slug}`,
  }));
  const initialSubscribe = seriesList.map((s, i) =>
    seriesToPoster(s, i, { hasSubscription: false, seasons: seasons[i] ?? [] }),
  );

  return (
    <HomeView
      movies={movies}
      seriesList={seriesList}
      seasons={seasons}
      initialTrending={initialTrending}
      initialFreeToday={initialFreeToday}
      initialSubscribe={initialSubscribe}
      promotionBanners={promotionBanners}
      heroFeatured={heroFeatured}
    />
  );
}
