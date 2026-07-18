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
  /** English title shown under the poster (or alone when no Khmer title). */
  titleBelow: string;
  /** Khmer title shown above the English title when present. */
  titleKm?: string | null;
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
  /** Click flips the card to a Buy / View-trailer back face (movie cards). */
  flipActions?: boolean;
  /** YouTube trailer for the back face's "View trailer" popup. */
  trailerUrl?: string | null;
};
