import { apiFetch } from "../core/client";

export type RatingRead = {
  content_id: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export type RatingWriteResult = {
  content_id: string;
  value: number;
  content_rating: string | null;
  rating_count: number;
};

/** Returns the signed-in user's own rating for this movie, or null if they haven't rated it. */
export async function getMyRating(contentId: string): Promise<RatingRead | null> {
  try {
    return await apiFetch<RatingRead>(`/ratings/${contentId}/me`);
  } catch (err) {
    if (err instanceof Error && (err as Error & { status?: number }).status === 404) {
      return null;
    }
    throw err;
  }
}

export function rateMovie(contentId: string, value: 1 | 2 | 3 | 4 | 5): Promise<RatingWriteResult> {
  return apiFetch<RatingWriteResult>(`/ratings/${contentId}`, {
    method: "PUT",
    body: { value },
  });
}
