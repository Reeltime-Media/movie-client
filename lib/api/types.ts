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
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonRead {
  season_number: number;
  episodes: ContentRead[];
}
