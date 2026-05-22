export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserRead {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentRead {
  id: string;
  type: string;
  slug: string;
  title: string;
  description: string | null;
  series_id: string | null;
  season_number: number | null;
  episode_number: number | null;
  genres: string[];
  release_year: number | null;
  rating: string | null;
  runtime: string | null;
  duration_seconds: number | null;
  poster_key: string | null;
  trailer_url: string | null;
  hls_master_key: string | null;
  price_usd: string | null;
  status: string;
  is_published: boolean;
  is_free: boolean;
  transcode_status: string;
  created_at: string;
  updated_at: string;
}

export interface SeriesRead {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  genres: string[];
  release_year: number | null;
  rating: string | null;
  monthly_price_usd: string | null;
  poster_key: string | null;
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
  user_id: string;
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
  reminder_sent_at: string | null;
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
