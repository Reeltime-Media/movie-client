import { apiFetch } from "./client";

export type HeroFeaturedSlide = {
  id: string;
  content_type: "movie" | "series" | "custom";
  title: string;
  slug: string;
  description: string | null;
  genres: string[];
  release_year: number | null;
  rating: string | null;
  runtime: string | null;
  poster_key: string | null;
  banner_key: string | null;
  watch_href: string | null;
  sort_order: number;
  video_key: string | null;
  youtube_url: string | null;
};

/** Admin-curated hero — revalidate often so picks show up quickly after edits. */
const heroFeaturedCache: RequestInit = {
  next: { revalidate: 30 },
} as RequestInit;

export async function listHeroFeatured(
  placement = "home",
  init: RequestInit = heroFeaturedCache,
): Promise<HeroFeaturedSlide[]> {
  const qs = new URLSearchParams({ placement });
  return apiFetch<HeroFeaturedSlide[]>(`/hero-featured/?${qs}`, init);
}
