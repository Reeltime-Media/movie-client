type PosterBadge =
  | { kind: "hd"; label: "HD" }
  | { kind: "owned"; label: "OWNED" }
  | { kind: "free"; label: "FREE" }
  | { kind: "none" };

type PosterEntitlement =
  | { kind: "price"; value: string }
  | { kind: "subscribed"; value: string }
  | { kind: "continue"; value: string }
  | { kind: "none" };

export type PosterCardProps = {
  /** Published movie id — enables favourite button when set. */
  contentId?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  posterTitle: string;
  titleBelow: string;
  posterGradient: string;
  accentColor: string;
  badge?: PosterBadge;
  subtitle?: { text: string; color: string };
  entitlement?: PosterEntitlement;
  /** 0–100. Shows a progress bar at the bottom of the poster when set. */
  progressPct?: number;
  watchHref?: string;
  watchLabel?: string;
  year?: number | null;
};
