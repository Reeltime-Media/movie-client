import { movieCardHref } from "@/lib/movie-routes";
import type { BannerCardProps } from "@/components/catalog/BannerCard";
import type { PosterCardProps } from "@/types/poster-card";
import { posterUrl } from "./config";
import {
  findFirstFreeEpisode,
  freeEpisodeWatchHref,
  seasonsHaveFreeEpisodes,
} from "./series-free";
import type { ContentListItemRead, SeasonRead, SeriesRead } from "./types";

export type SeriesPosterOptions = {
  hasSubscription?: boolean;
  seasons?: SeasonRead[];
};

/** Deterministic gradient palette — cycles by index. */
const GRADIENTS: Array<{ gradient: string; accent: string }> = [
  { gradient: "linear-gradient(155deg, #2a0c10, #6b1419, #0f0608)", accent: "#E50914" },
  { gradient: "linear-gradient(180deg, #14101a, #2c1a3d, #0c0612)", accent: "#b08fd9" },
  { gradient: "linear-gradient(140deg, #1c0d05, #3d1e08, #0f0703)", accent: "#d4a04a" },
  { gradient: "linear-gradient(165deg, #1a0a18, #4a1538, #0a040a)", accent: "#ed7aa6" },
  { gradient: "linear-gradient(180deg, #0a1f30, #040a14, #000000)", accent: "#5cb8d4" },
  { gradient: "linear-gradient(180deg, #1a1a08, #404010, #0a0a04)", accent: "#d4cc5c" },
  { gradient: "linear-gradient(180deg, #0e3d20, #04140a, #000000)", accent: "#5cd49a" },
  { gradient: "linear-gradient(180deg, #1a0e08, #421a08, #0a0604)", accent: "#e8965c" },
  { gradient: "linear-gradient(160deg, #07151a, #11323a, #030a0c)", accent: "#5cb8d4" },
  { gradient: "linear-gradient(155deg, #0a0f1f, #141a3d, #06070f)", accent: "#7c8bff" },
];

function pick(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export function movieToPoster(
  movie: ContentListItemRead,
  index = 0,
  ownedIds?: Set<string>,
): PosterCardProps {
  const { gradient, accent } = pick(index);
  const isFree = !movie.price_usd || parseFloat(movie.price_usd) === 0;
  const isOwned = isFree || ownedIds?.has(movie.id);
  const price =
    !isFree && movie.price_usd
      ? `$${parseFloat(movie.price_usd).toFixed(2)}`
      : null;

  return {
    contentId: movie.id,
    imageSrc: posterUrl(movie.poster_key),
    posterTitle: movie.title.toUpperCase(),
    titleBelow: movie.title,
    posterGradient: gradient,
    accentColor: accent,
    badge: isOwned && !isFree ? { kind: "owned", label: "OWNED" } : { kind: "none" },
    entitlement: isOwned || !price ? { kind: "none" } : { kind: "price", value: price },
    watchHref: movieCardHref(movie, Boolean(isOwned)),
    year: movie.release_year,
  };
}

export function seriesToPoster(
  series: SeriesRead,
  index = 0,
  options?: boolean | SeriesPosterOptions,
): PosterCardProps {
  const { gradient, accent } = pick(index);
  const opts: SeriesPosterOptions =
    typeof options === "boolean" ? { hasSubscription: options } : (options ?? {});
  const hasSubscription = Boolean(opts.hasSubscription);
  const seasons = opts.seasons ?? [];
  const hasFreeEpisodes = seasonsHaveFreeEpisodes(seasons);
  const firstFree = hasFreeEpisodes ? findFirstFreeEpisode(seasons) : null;

  let watchLabel = "View series";
  let watchHref = `/watch/series/${series.slug}/1/1`;

  if (hasSubscription) {
    watchLabel = "Watch";
  } else if (firstFree) {
    watchLabel = "Watch now";
    watchHref = freeEpisodeWatchHref(series.slug, firstFree);
  } else {
    watchLabel = "View series";
  }

  return {
    imageSrc: posterUrl(series.poster_key),
    posterTitle: series.title.toUpperCase(),
    titleBelow: series.title,
    posterGradient: gradient,
    accentColor: accent,
    subtitle: { text: "A SERIES", color: accent },
    entitlement: hasSubscription ? { kind: "subscribed", value: "Subscribed" } : { kind: "none" },
    watchLabel,
    watchHref,
    year: series.release_year,
  };
}

export function movieToBanner(
  movie: ContentListItemRead,
  ownedIds?: Set<string>,
): BannerCardProps {
  const isFree = !movie.price_usd || parseFloat(movie.price_usd) === 0;
  const owned = isFree || Boolean(ownedIds?.has(movie.id));
  const price =
    !isFree && movie.price_usd ? `$${parseFloat(movie.price_usd).toFixed(2)}` : undefined;
  return {
    imageSrc: posterUrl(movie.poster_key),
    imageAlt: movie.title,
    title: movie.title,
    year: movie.release_year,
    badgeLabel: price,
    watchHref: movieCardHref(movie, owned),
  };
}

export function seriesToBanner(series: SeriesRead, badgeLabel = "រឿងភាគ"): BannerCardProps {
  return {
    imageSrc: posterUrl(series.banner_key) ?? posterUrl(series.poster_key),
    imageAlt: series.title,
    title: series.title,
    year: series.release_year,
    badgeLabel,
    watchHref: `/watch/series/${series.slug}/1/1`,
  };
}
