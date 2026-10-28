import { apiFetch } from "../core/client";
import type { ContentListItemRead, TvChannelRead } from "../types";
import type { HeroFeaturedSlide } from "./hero-featured";
import type { PromotionBannerRead } from "./promotion-banners";

export type HomeSectionPublic = {
  id: string;
  type: string;
  title: string | null;
  genre_name: string | null;
  sort_order: number;
  movies: ContentListItemRead[];
  series: Array<{
    id: string;
    slug: string;
    title: string;
    title_km?: string | null;
    genres: string[];
    release_year: number | null;
    rating: number | null;
    poster_key: string | null;
    banner_key: string | null;
    monthly_price_usd: string | number;
    is_short_movie: boolean;
    free_episode_count?: number;
    region?: string | null;
    updated_at: string;
  }>;
  channels: TvChannelRead[];
  hero_slides: HeroFeaturedSlide[];
  banners: PromotionBannerRead[];
};

const homeSectionsCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listHomeSections(
  init: RequestInit = homeSectionsCache,
): Promise<HomeSectionPublic[]> {
  return apiFetch<HomeSectionPublic[]>("/home/sections/", init);
}
