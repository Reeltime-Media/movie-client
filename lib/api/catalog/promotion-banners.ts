import { apiFetch, catalogCache } from "../core/client";

export type PromotionBannerRead = {
  id: string;
  title: string;
  subtitle: string | null;
  image_key: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placement: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPromotionBanners(
  placement = "home",
): Promise<PromotionBannerRead[]> {
  const qs = new URLSearchParams({ placement });
  return apiFetch<PromotionBannerRead[]>(`/promotion-banners/?${qs}`, catalogCache);
}
