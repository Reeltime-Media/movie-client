import { HomeView } from "@/components/home/HomeView";
import { listComingSoon, listFreeToday } from "@/lib/api/catalog";
import { listHeroFeatured } from "@/lib/api/catalog";
import { listMoviesPage } from "@/lib/api/movies";
import { listPromotionBanners } from "@/lib/api/catalog";
import { listSeriesPage } from "@/lib/api/series";
import { movieToPoster } from "@/lib/api/mappers";
import { swallow } from "@/lib/log";

/** Enough movies for trending + genre rails without draining the full catalog. */
const HOME_MOVIE_LIMIT = 60;
const HOME_SERIES_LIMIT = 12;

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function Home() {
  const [movies, seriesList, promotionBanners, heroFeatured, freeToday, comingSoon] =
    await Promise.all([
      listMoviesPage(undefined, HOME_MOVIE_LIMIT).catch(swallow("home: load movies", [])),
      listSeriesPage(undefined, HOME_SERIES_LIMIT).catch(swallow("home: load series", [])),
      listPromotionBanners("home").catch(swallow("home: load promotion banners", [])),
      listHeroFeatured("home").catch(swallow("home: load hero featured", [])),
      listFreeToday().catch(swallow("home: load free today", [])),
      listComingSoon().catch(swallow("home: load coming soon", [])),
    ]);

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
  // Coming Soon: poster + trailer only — never a watch / buy CTA.
  const initialComingSoon = comingSoon.map((m, i) => ({
    ...movieToPoster(m, i, new Set<string>()),
    badge: { kind: "soon", label: "SOON" } as const,
    entitlement: { kind: "none" } as const,
    watchHref: "#",
  }));

  return (
    <HomeView
      movies={movies}
      seriesList={seriesList}
      initialTrending={initialTrending}
      initialFreeToday={initialFreeToday}
      initialComingSoon={initialComingSoon}
      promotionBanners={promotionBanners}
      heroFeatured={heroFeatured}
    />
  );
}
