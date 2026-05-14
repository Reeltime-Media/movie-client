export type WatchSeriesEpisode = {
  n: number;
  title: string;
  duration: string;
};

export type WatchSeriesSeason = {
  n: number;
  freeEpisodeCount?: number;
  episodes: readonly WatchSeriesEpisode[];
};

export type WatchSeriesDetail = {
  slug: string;
  title: string;
  synopsis: string;
  year: string;
  rating: string;
  genres: readonly string[];
  maturity: string;
  seasons: readonly WatchSeriesSeason[];
};

const EP_DEMO = "24m" as const;
export const DEFAULT_FREE_EPISODE_COUNT = 3;

function eps(
  titles: readonly string[],
): readonly WatchSeriesEpisode[] {
  return titles.map((title, i) => ({
    n: i + 1,
    title,
    duration: EP_DEMO,
  }));
}

/** One season numbered 1 (most catalog titles). */
function s1(titles: readonly string[]): readonly WatchSeriesSeason[] {
  return [
    {
      n: 1,
      freeEpisodeCount: Math.min(DEFAULT_FREE_EPISODE_COUNT, titles.length),
      episodes: eps(titles),
    },
  ];
}

export const WATCH_SERIES_BY_SLUG = {
  "echo-valley": {
    slug: "echo-valley",
    title: "Echo Valley",
    synopsis:
      "A small town journalist returns home after a decade away and finds the valley wired with secrets that refuse to stay buried.",
    year: "2025",
    rating: "8.4",
    genres: ["Drama", "Mystery"] as const,
    maturity: "TV-14",
    seasons: [
      {
        n: 1,
        freeEpisodeCount: DEFAULT_FREE_EPISODE_COUNT,
        episodes: eps([
          "Signal in the static",
          "Paper trail",
          "The safe house",
          "Low water",
        ]),
      },
      {
        n: 2,
        freeEpisodeCount: DEFAULT_FREE_EPISODE_COUNT,
        episodes: eps([
          "Night choir",
          "Cold return",
          "Witness tree",
          "Last transmission",
        ]),
      },
    ],
  },
  "midnight-run": {
    slug: "midnight-run",
    title: "Midnight Run",
    synopsis:
      "After a coastal blackout, runners carry messages the network cannot. One route crosses a line no one is meant to cross.",
    year: "2026",
    rating: "8.1",
    genres: ["Sci-fi", "Thriller"] as const,
    maturity: "TV-MA",
    seasons: s1([
      "Pilot: dead band",
      "Harbor lights",
      "Relay zero",
      "Salt line",
      "Ghost channel",
      "Whiteout",
    ]),
  },
  "final-frame": {
    slug: "final-frame",
    title: "Final Frame",
    synopsis:
      "A forensic film archivist notices identical damage patterns across unrelated reels. The last frame always shows the same room.",
    year: "2025",
    rating: "7.9",
    genres: ["Horror", "Mystery"] as const,
    maturity: "TV-MA",
    seasons: s1([
      "Celluloid teeth",
      "Splice",
      "Projector B",
      "Burn test",
      "Negative space",
      "Cut to black",
    ]),
  },
  glasshouse: {
    slug: "glasshouse",
    title: "Glasshouse",
    synopsis:
      "Inside a sealed research habitat, the crew stops counting days. Outside contact is routine until the next message arrives early.",
    year: "2026",
    rating: "8.0",
    genres: ["Psychological", "Sci-fi"] as const,
    maturity: "TV-14",
    seasons: s1([
      "Seal date",
      "Humidity index",
      "Glass tongue",
      "Control loop",
      "Greenhouse rules",
      "Breath sample",
    ]),
  },
  "hollow-coast": {
    slug: "hollow-coast",
    title: "Hollow Coast",
    synopsis:
      "Smugglers use the tide tables like scripture. When a body washes in on the wrong moon, every dock ledger becomes evidence.",
    year: "2025",
    rating: "8.2",
    genres: ["Crime", "Noir"] as const,
    maturity: "TV-MA",
    seasons: s1([
      "Low tide ledger",
      "Rope church",
      "Brine marks",
      "Second harbor",
      "Fog signal",
      "Hollow moon",
    ]),
  },
  "neon-quarter": {
    slug: "neon-quarter",
    title: "Neon Quarter",
    synopsis:
      "Three fixers share one neighborhood and one rule: never take the same job twice. A duplicate contract breaks the truce.",
    year: "2026",
    rating: "8.3",
    genres: ["Crime", "Drama"] as const,
    maturity: "TV-MA",
    seasons: s1([
      "Quarter map",
      "Mirror job",
      "Soft lock",
      "Rain market",
      "Neon debt",
      "Truce line",
      "After curfew",
    ]),
  },
  "dust-and-tide": {
    slug: "dust-and-tide",
    title: "Dust & Tide",
    synopsis:
      "A family farm sits between a dying aquifer and a new mine. Water rights hearings become a countdown nobody agreed to start.",
    year: "2025",
    rating: "8.0",
    genres: ["Drama", "Political"] as const,
    maturity: "TV-14",
    seasons: s1([
      "Well reading",
      "Dust clause",
      "Public comment",
      "Tide table",
      "Hearing day",
      "Dry season",
    ]),
  },
  "city-loom": {
    slug: "city-loom",
    title: "City Loom",
    synopsis:
      "Urban planners model a megacity that updates nightly. When a real block vanishes to match the simulation, the model becomes law.",
    year: "2026",
    rating: "7.8",
    genres: ["Thriller", "Sci-fi"] as const,
    maturity: "TV-14",
    seasons: s1([
      "Zoning ghost",
      "Loom v0",
      "Paper city",
      "Live block",
      "Override key",
      "Soft demolition",
      "Mirror grid",
    ]),
  },
} satisfies Record<string, WatchSeriesDetail>;

export type WatchSeriesSlug = keyof typeof WATCH_SERIES_BY_SLUG;

export function getWatchSeries(slug: string): WatchSeriesDetail | null {
  const entry = WATCH_SERIES_BY_SLUG[slug as WatchSeriesSlug];
  return entry ?? null;
}

export function getSeason(
  series: WatchSeriesDetail,
  seasonNumber: number,
): WatchSeriesSeason | null {
  return series.seasons.find((s) => s.n === seasonNumber) ?? null;
}

export function getFreeEpisodeCount(season: WatchSeriesSeason): number {
  return Math.min(season.freeEpisodeCount ?? 0, season.episodes.length);
}

export function isEpisodeFree(
  season: WatchSeriesSeason,
  episodeNumber: number,
): boolean {
  return episodeNumber <= getFreeEpisodeCount(season);
}

export function watchSeriesPath(
  slug: string,
  season: number,
  episode: number,
): string {
  return `/watch/series/${slug}/${season}/${episode}`;
}
