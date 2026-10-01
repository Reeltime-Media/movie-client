"use client";

import { Check, Plus } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useI18n } from "@/components/providers/LocaleProvider";

/** Add/remove toggle on the watch pages; `contentId` is a movie id or a series id. */
export function FavouriteButton({ contentId }: { contentId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useI18n();
  const active = isFavorite(contentId);

  return (
    <button
      type="button"
      onClick={() => void toggleFavorite(contentId)}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-bold transition-colors",
        active
          ? "border border-border bg-surface-elevated text-text hover:border-border-hover"
          : "bg-brand text-white hover:bg-brand-hover",
      ].join(" ")}
    >
      {active ? (
        <Check size={15} aria-hidden />
      ) : (
        <Plus size={15} aria-hidden />
      )}
      {active ? t("favoriteRemove") : t("favoriteAdd")}
    </button>
  );
}
