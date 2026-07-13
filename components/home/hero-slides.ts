import { posterUrl } from "@/lib/api/client";
import type { HeroFeaturedSlide } from "@/lib/api/hero-featured";
import type { ContentListItemRead, SeriesRead } from "@/lib/api/types";

export type HeroSlide = {
  id: string;
  title: string;
  year: string;
  duration: string;
  rating: string;
  genres: string;
  description: string;
  bannerSrc: string;
  watchHref: string | null;
  isCustom: boolean;
  videoSrc: string | null;
  youtubeUrl: string | null;
};

function bannerImageSrc(bannerKey?: string | null): string {
  return posterUrl(bannerKey) ?? "";
}

export function slideFromFeatured(slide: HeroFeaturedSlide): HeroSlide {
  return {
    id: slide.id,
    title: slide.title,
    year: slide.release_year?.toString() ?? "",
    duration: slide.runtime ?? (slide.content_type === "series" ? "Series" : ""),
    rating: slide.rating != null ? String(slide.rating) : "",
    genres: (slide.genres ?? []).join(" · "),
    description: slide.description ?? "",
    bannerSrc: bannerImageSrc(slide.banner_key),
    watchHref: slide.watch_href,
    isCustom: slide.content_type === "custom",
    videoSrc: posterUrl(slide.video_key) ?? null,
    youtubeUrl: slide.video_key ? null : slide.youtube_url,
  };
}

export function buildFallbackSlides(
  movies: ContentListItemRead[],
  seriesList: SeriesRead[],
): HeroSlide[] {
  const movieSlides = movies.slice(0, 3).map((m) => ({
    id: m.id,
    title: m.title,
    year: m.release_year?.toString() ?? "",
    duration: m.runtime ?? "",
    rating: m.rating != null ? String(m.rating) : "",
    genres: (m.genres ?? []).join(" · "),
    description: m.description ?? "",
    bannerSrc: "",
    watchHref: `/watch?slug=${m.slug}`,
    isCustom: false,
    videoSrc: null,
    youtubeUrl: null,
  }));
  const seriesSlides = seriesList.slice(0, 2).map((s) => ({
    id: s.id,
    title: s.title,
    year: s.release_year?.toString() ?? "",
    duration: "Series",
    rating: s.rating != null ? String(s.rating) : "",
    genres: (s.genres ?? []).join(" · "),
    description: s.description ?? "",
    bannerSrc: bannerImageSrc(s.banner_key),
    watchHref: `/watch/series/${s.slug}/1/1`,
    isCustom: false,
    videoSrc: null,
    youtubeUrl: null,
  }));
  return [...movieSlides, ...seriesSlides];
}
