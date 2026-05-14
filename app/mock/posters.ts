import type { PosterCardProps } from "@/app/components/PosterCard";

export const posterCatalog = {
  lastDrive: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "THE LAST DRIVE",
    titleBelow: "The Last Drive",
    posterGradient:
      "linear-gradient(155deg, #2a0c10, #6b1419, #0f0608)",
    accentColor: "#E50914",
    badge: { kind: "hd", label: "HD" },
    entitlement: { kind: "price", value: "$2.99" },
    watchHref: "/pay/movie?title=The%20Last%20Drive&price=%242.99",
  },
  echoValleySubscribe: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "ECHO VALLEY",
    titleBelow: "Echo Valley",
    posterGradient:
      "linear-gradient(180deg, #14101a, #2c1a3d, #0c0612)",
    accentColor: "#b08fd9",
    subtitle: { text: "A SERIES", color: "#b08fd9" },
    entitlement: { kind: "continue", value: "S1 E3" },
    progressPct: 37,
    watchHref: "/watch/series/echo-valley/1/3",
  },
  crownOfAsh: {
    imageSrc: "/movie_sample/poster3.png",
    posterTitle: "CROWN OF ASH",
    titleBelow: "Crown of Ash",
    posterGradient:
      "linear-gradient(140deg, #1c0d05, #3d1e08, #0f0703)",
    accentColor: "#d4a04a",
    badge: { kind: "owned", label: "OWNED" },
    entitlement: { kind: "continue", value: "42m left" },
    progressPct: 64,
    watchHref: "/watch?title=Crown%20of%20Ash",
  },
  afterHours: {
    imageSrc: "/movie_sample/poster5.png",
    posterTitle: "AFTER HOURS",
    titleBelow: "After Hours",
    posterGradient:
      "linear-gradient(165deg, #1a0a18, #4a1538, #0a040a)",
    accentColor: "#ed7aa6",
    entitlement: { kind: "price", value: "$3.99" },
    watchHref: "/pay/movie?title=After%20Hours&price=%243.99",
  },
  midnightRun: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "MIDNIGHT RUN",
    titleBelow: "Midnight Run",
    posterGradient:
      "linear-gradient(180deg, #0a1f30, #040a14, #000000)",
    accentColor: "#5cb8d4",
    watchLabel: "Start free",
    watchHref: "/watch/series/midnight-run/1/1",
  },
  finalFrame: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "FINAL FRAME",
    titleBelow: "Final Frame",
    posterGradient:
      "linear-gradient(180deg, #1a1a08, #404010, #0a0a04)",
    accentColor: "#d4cc5c",
    watchLabel: "Start free",
    watchHref: "/watch/series/final-frame/1/1",
  },
  glasshouse: {
    imageSrc: "/movie_sample/poster3.png",
    posterTitle: "GLASSHOUSE",
    titleBelow: "Glasshouse",
    posterGradient:
      "linear-gradient(180deg, #0e3d20, #04140a, #000000)",
    accentColor: "#5cd49a",
    watchLabel: "Start free",
    watchHref: "/watch/series/glasshouse/1/1",
  },
  hollowCoast: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "HOLLOW COAST",
    titleBelow: "Hollow Coast",
    posterGradient:
      "linear-gradient(180deg, #1a0e08, #421a08, #0a0604)",
    accentColor: "#e8965c",
    watchLabel: "Start free",
    watchHref: "/watch/series/hollow-coast/1/1",
  },
  riverSignal: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "RIVER SIGNAL",
    titleBelow: "River Signal",
    posterGradient:
      "linear-gradient(160deg, #07151a, #11323a, #030a0c)",
    accentColor: "#5cb8d4",
    badge: { kind: "hd", label: "HD" },
    entitlement: { kind: "price", value: "$3.49" },
    watchHref: "/pay/movie?title=River%20Signal&price=%243.49",
  },
  silentAlleyRent: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "SILENT ALLEY",
    titleBelow: "Silent Alley",
    posterGradient:
      "linear-gradient(155deg, #0a0f1f, #141a3d, #06070f)",
    accentColor: "#7c8bff",
    entitlement: { kind: "price", value: "$2.49" },
    watchHref: "/pay/movie?title=Silent%20Alley&price=%242.49",
  },
  burnLineRent: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "BURN LINE",
    titleBelow: "Burn Line",
    posterGradient:
      "linear-gradient(150deg, #200c0c, #5a1515, #0f0606)",
    accentColor: "#ef4444",
    entitlement: { kind: "price", value: "$3.99" },
    watchHref: "/pay/movie?title=Burn%20Line&price=%243.99",
  },
  nightFerryRent: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "NIGHT FERRY",
    titleBelow: "Night Ferry",
    posterGradient:
      "linear-gradient(155deg, #0a1a18, #0f3a33, #04110f)",
    accentColor: "#5cd49a",
    entitlement: { kind: "price", value: "$2.99" },
    watchHref: "/pay/movie?title=Night%20Ferry&price=%242.99",
  },
  finalTurnRent: {
    imageSrc: "/movie_sample/poster3.png",
    posterTitle: "FINAL TURN",
    titleBelow: "Final Turn",
    posterGradient:
      "linear-gradient(160deg, #1c1206, #3d2708, #0f0a03)",
    accentColor: "#f59e0b",
    entitlement: { kind: "price", value: "$2.99" },
    watchHref: "/pay/movie?title=Final%20Turn&price=%242.99",
  },
  neonQuarter: {
    imageSrc: "/movie_sample/poster5.png",
    posterTitle: "NEON QUARTER",
    titleBelow: "Neon Quarter",
    posterGradient:
      "linear-gradient(170deg, #12061a, #3b0f4a, #0a040a)",
    accentColor: "#ed7aa6",
    subtitle: { text: "A SERIES", color: "#ed7aa6" },
    watchLabel: "Watch",
    watchHref: "/pay/subscription?title=Neon%20Quarter",
  },
  dustAndTide: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "DUST & TIDE",
    titleBelow: "Dust & Tide",
    posterGradient:
      "linear-gradient(165deg, #07140d, #123d20, #020a06)",
    accentColor: "#5cd49a",
    subtitle: { text: "A SERIES", color: "#5cd49a" },
    watchLabel: "Watch",
    watchHref: "/pay/subscription?title=Dust%20%26%20Tide",
  },
  cityLoom: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "CITY LOOM",
    titleBelow: "City Loom",
    posterGradient:
      "linear-gradient(165deg, #0a0f18, #1b2c55, #05070f)",
    accentColor: "#7c8bff",
    subtitle: { text: "A SERIES", color: "#7c8bff" },
    watchLabel: "Watch",
    watchHref: "/pay/subscription?title=City%20Loom",
  },
  silentAlleyOwned: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "SILENT ALLEY",
    titleBelow: "Silent Alley",
    posterGradient:
      "linear-gradient(155deg, #0a0f1f, #141a3d, #06070f)",
    accentColor: "#7c8bff",
    badge: { kind: "owned", label: "OWNED" },
    entitlement: { kind: "none" },
    watchHref: "/watch?title=Silent%20Alley",
  },
  nightFerryOwned: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "NIGHT FERRY",
    titleBelow: "Night Ferry",
    posterGradient:
      "linear-gradient(155deg, #0a1a18, #0f3a33, #04110f)",
    accentColor: "#5cd49a",
    badge: { kind: "owned", label: "OWNED" },
    entitlement: { kind: "none" },
    watchHref: "/watch?title=Night%20Ferry",
  },
  finalTurnOwned: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "FINAL TURN",
    titleBelow: "Final Turn",
    posterGradient:
      "linear-gradient(160deg, #1c1206, #3d2708, #0f0a03)",
    accentColor: "#f59e0b",
    badge: { kind: "owned", label: "OWNED" },
    entitlement: { kind: "none" },
    watchHref: "/watch?title=Final%20Turn",
  },
  riverSignalWatch: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "RIVER SIGNAL",
    titleBelow: "River Signal",
    posterGradient:
      "linear-gradient(160deg, #07151a, #11323a, #030a0c)",
    accentColor: "#5cb8d4",
    badge: { kind: "hd", label: "HD" },
    entitlement: { kind: "price", value: "$3.49" },
    watchHref: "/watch?title=River%20Signal",
  },
  silentAlleyWatch: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "SILENT ALLEY",
    titleBelow: "Silent Alley",
    posterGradient:
      "linear-gradient(155deg, #0a0f1f, #141a3d, #06070f)",
    accentColor: "#7c8bff",
    entitlement: { kind: "price", value: "$2.49" },
    watchHref: "/watch?title=Silent%20Alley",
  },
  nightFerryWatch: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "NIGHT FERRY",
    titleBelow: "Night Ferry",
    posterGradient:
      "linear-gradient(155deg, #0a1a18, #0f3a33, #04110f)",
    accentColor: "#5cd49a",
    entitlement: { kind: "continue", value: "28m left" },
    progressPct: 71,
    watchHref: "/watch?title=Night%20Ferry",
  },
  finalTurnWatch: {
    imageSrc: "/movie_sample/poster3.png",
    posterTitle: "FINAL TURN",
    titleBelow: "Final Turn",
    posterGradient:
      "linear-gradient(160deg, #1c1206, #3d2708, #0f0a03)",
    accentColor: "#f59e0b",
    entitlement: { kind: "continue", value: "51m left" },
    progressPct: 49,
    watchHref: "/watch?title=Final%20Turn",
  },
  midnightRunSeriesSubscribe: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "MIDNIGHT RUN",
    titleBelow: "Midnight Run",
    posterGradient:
      "linear-gradient(180deg, #0a1f30, #040a14, #000000)",
    accentColor: "#5cb8d4",
    subtitle: { text: "A SERIES", color: "#5cb8d4" },
    watchLabel: "Subscribe",
    watchHref: "/pay/subscription?title=Midnight%20Run",
  },
  echoValleySeriesSubscribe: {
    imageSrc: "/movie_sample/poster4.png",
    posterTitle: "ECHO VALLEY",
    titleBelow: "Echo Valley",
    posterGradient:
      "linear-gradient(180deg, #14101a, #2c1a3d, #0c0612)",
    accentColor: "#b08fd9",
    subtitle: { text: "A SERIES", color: "#b08fd9" },
    watchLabel: "Subscribe",
    watchHref: "/pay/subscription?title=Echo%20Valley",
  },
  glasshouseSeriesSubscribe: {
    imageSrc: "/movie_sample/poster3.png",
    posterTitle: "GLASSHOUSE",
    titleBelow: "Glasshouse",
    posterGradient:
      "linear-gradient(180deg, #0e3d20, #04140a, #000000)",
    accentColor: "#5cd49a",
    subtitle: { text: "A SERIES", color: "#5cd49a" },
    watchLabel: "Subscribe",
    watchHref: "/pay/subscription?title=Glasshouse",
  },
  hollowCoastSeriesSubscribe: {
    imageSrc: "/movie_sample/poster2.png",
    posterTitle: "HOLLOW COAST",
    titleBelow: "Hollow Coast",
    posterGradient:
      "linear-gradient(180deg, #1a0e08, #421a08, #0a0604)",
    accentColor: "#e8965c",
    subtitle: { text: "A SERIES", color: "#e8965c" },
    watchLabel: "Subscribe",
    watchHref: "/pay/subscription?title=Hollow%20Coast",
  },
  northLineSeries: {
    imageSrc: "/movie_sample/poster1.png",
    posterTitle: "NORTH LINE",
    titleBelow: "North Line",
    posterGradient:
      "linear-gradient(185deg, #0c1822, #1a3550, #050a0f)",
    accentColor: "#7c8bff",
    subtitle: { text: "A SERIES", color: "#7c8bff" },
    watchLabel: "Subscribe",
    watchHref: "/pay/subscription?title=North%20Line",
  },
} satisfies Record<string, PosterCardProps>;

export type PosterCatalogKey = keyof typeof posterCatalog;

export function postersFor<K extends PosterCatalogKey>(
  keys: readonly K[],
): PosterCardProps[] {
  return keys.map((key) => posterCatalog[key]);
}

/** Home “Trending now” horizontal rail — 10 titles, movie-focused. */
export const homeTrendingPosters = postersFor([
  "lastDrive",
  "afterHours",
  "riverSignal",
  "crownOfAsh",
  "silentAlleyRent",
  "burnLineRent",
  "nightFerryRent",
  "finalTurnRent",
  "riverSignalWatch",
  "silentAlleyWatch",
]);

/** Home “Series · Subscribe to unlock” rail — 10 scrollable tiles, unique `watchHref` each. */
export const homeSubscribeRailPosters = postersFor([
  "midnightRun",
  "finalFrame",
  "glasshouse",
  "hollowCoast",
  "neonQuarter",
  "dustAndTide",
  "cityLoom",
  "echoValleySeriesSubscribe",
  "echoValleySubscribe",
  "northLineSeries",
]);

/** Home — resume row */
export const homeContinueWatchingPosters = postersFor([
  "crownOfAsh",
  "echoValleySubscribe",
  "lastDrive",
  "afterHours",
  "nightFerryWatch",
  "finalTurnWatch",
  "riverSignalWatch",
  "silentAlleyWatch",
  "nightFerryRent",
  "finalTurnRent",
]);

/** Home — crime / thriller emphasis */
export const homeLateNightThrillersPosters = postersFor([
  "silentAlleyRent",
  "burnLineRent",
  "nightFerryRent",
  "finalTurnRent",
  "riverSignal",
  "silentAlleyWatch",
  "riverSignalWatch",
  "afterHours",
  "crownOfAsh",
  "lastDrive",
]);

/** Home — owned titles + related buys */
export const homeLibrarySpotlightPosters = postersFor([
  "silentAlleyOwned",
  "nightFerryOwned",
  "finalTurnOwned",
  "crownOfAsh",
  "silentAlleyRent",
  "nightFerryWatch",
  "finalTurnWatch",
  "riverSignal",
  "lastDrive",
  "afterHours",
]);

export const moviesTrendingPosters = postersFor([
  "lastDrive",
  "crownOfAsh",
  "afterHours",
  "riverSignal",
]);

export const moviesActionPosters = postersFor([
  "silentAlleyRent",
  "burnLineRent",
  "nightFerryRent",
  "finalTurnRent",
]);

export const seriesSubscribePosters = postersFor([
  "midnightRun",
  "finalFrame",
  "glasshouse",
  "hollowCoast",
]);

export const seriesPopularPosters = postersFor([
  "echoValleySubscribe",
  "neonQuarter",
  "dustAndTide",
  "cityLoom",
]);

export const libraryContinuePosters = postersFor([
  "crownOfAsh",
  "echoValleySubscribe",
  "lastDrive",
  "afterHours",
]);

export const libraryOwnedPosters = postersFor([
  "crownOfAsh",
  "silentAlleyOwned",
  "nightFerryOwned",
  "finalTurnOwned",
]);

export const watchMoreLikeThisPosters = postersFor([
  "lastDrive",
  "afterHours",
  "riverSignalWatch",
  "silentAlleyWatch",
]);

export const watchTrendingPosters = postersFor([
  "crownOfAsh",
  "burnLineRent",
  "nightFerryWatch",
  "finalTurnWatch",
]);

export const watchSeriesPicksPosters = postersFor([
  "midnightRunSeriesSubscribe",
  "echoValleySeriesSubscribe",
  "glasshouseSeriesSubscribe",
  "hollowCoastSeriesSubscribe",
]);
