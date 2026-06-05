"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useI18n } from "@/components/providers/LocaleProvider";

export function FavoriteButton({
  contentId,
  className,
  size = 16,
  variant = "overlay",
}: {
  contentId: string;
  className?: string;
  size?: number;
  variant?: "overlay" | "inline";
}) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite, loaded } = useFavorites();
  const active = loaded && isFavorite(contentId);
  const label = active ? t("favoriteRemove") : t("favoriteAdd");

  const variantClass =
    variant === "inline"
      ? [
          "gap-2 rounded-md border px-4 py-2.5 text-[13px] font-semibold backdrop-blur-sm",
          active
            ? "border-brand/40 bg-brand/10 text-brand"
            : "border-border bg-surface/80 text-text hover:border-border-hover",
        ].join(" ")
      : [
          "rounded-full border border-white/25 bg-black/45 p-2 text-white backdrop-blur-sm hover:scale-105 hover:bg-black/60",
          active ? "text-brand" : "text-white/90 hover:text-white",
        ].join(" ");

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFavorite(contentId);
      }}
      className={[
        "inline-flex cursor-pointer items-center justify-center transition-[transform,colors,background-color] duration-200",
        variantClass,
        className ?? "",
      ].join(" ")}
    >
      <Heart
        size={size}
        className={active ? "fill-brand text-brand" : ""}
        strokeWidth={2}
        aria-hidden
      />
      {variant === "inline" ? <span>{label}</span> : null}
    </button>
  );
}
