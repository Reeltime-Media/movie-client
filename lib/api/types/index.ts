export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserRead {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

/** Public catalog list row from GET /movies/ */
export interface ContentListItemRead {
  id: string;
  type: string;
  slug: string;
  title: string;
  title_km?: string | null;
  description: string | null;
  genres: string[];
  poster_key: string | null;
  banner_key: string | null;
  price_usd: string | null;
  rating: string | null;
  runtime: string | null;
  release_year: number | null;
  is_free: boolean;
  /** Lets catalog cards offer a trailer preview without a detail fetch. */
  trailer_url?: string | null;
}

/** Public teaser row from GET /movies/coming-soon */
export interface ComingSoonItemRead {
  id: string;
  slug: string;
  title: string;
  title_km?: string | null;
  poster_key: string | null;
  banner_key: string | null;
  /** ISO datetime. Announced release date/time; null = not yet announced (TBA). */
  release_at: string | null;
}

export interface ContentRead extends ContentListItemRead {
  series_id: string | null;
  season_number: number | null;
  episode_number: number | null;
  duration_seconds: number | null;
  trailer_url: string | null;
  hls_master_key: string | null;
  status: string;
  is_published: boolean;
  /** True while the movie is in the admin-curated "Free movies today" list. */
  is_free_today?: boolean;
  transcode_status: string;
  created_at: string;
  updated_at: string;
}

export interface SeriesRead {
  id: string;
  slug: string;
  title: string;
  title_km?: string | null;
  description: string | null;
  genres: string[];
  release_year: number | null;
  rating: string | null;
  monthly_price_usd: string | null;
  poster_key: string | null;
  banner_key: string | null;
  trailer_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonRead {
  season_number: number;
  episodes: ContentRead[];
}

export interface PurchaseRead {
  id: string;
  user_id: string | null;
  content_id: string;
  intent_id: string;
  order_id: string;
  amount_usd: string;
  created_at: string;
}

export interface SubscriptionRead {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanRead {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_usd: string;
  billing_interval_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WatchProgressRead {
  user_id: string;
  content_id: string;
  position_seconds: number;
  completed: boolean;
  last_watched_at: string;
}

/** Public live-TV channel row from GET /tv/channels. */
export interface TvChannelRead {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_key: string | null;
  /** "live" | "offline" — server never reports intermediate states publicly. */
  status: string;
  is_free: boolean;
}

export interface TvChannelAuthorizeRead {
  master_url: string;
  expires_in: number;
}
