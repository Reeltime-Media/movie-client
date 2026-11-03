"use client";

import { Headphones, Loader2, Lock, Mic, Play } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterThumbUrl } from "@/lib/api/core";
import type { ContentListItemRead } from "@/lib/api/types";
import { podcastHeadline } from "@/lib/podcast-access";

export type PodcastEpisodeRowProps = {
  podcast: ContentListItemRead;
  /** True when this viewer can listen without subscribing (free, subscribed, admin). */
  isEntitled: boolean;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (podcast: ContentListItemRead) => void;
};

export function PodcastEpisodeRow({
  podcast,
  isEntitled,
  isSelected,
  isLoading,
  onSelect,
}: PodcastEpisodeRowProps) {
  const { t } = useI18n();
  const { eyebrow, title } = podcastHeadline(podcast);
  const cover = posterThumbUrl(podcast.poster_key, 400, podcast.updated_at);
  const locked = !podcast.is_free && !isEntitled;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(podcast)}
      className={[
        "group flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition-colors sm:gap-4 sm:p-3",
        isSelected
          ? "border-brand bg-surface-elevated"
          : "border-border bg-surface hover:border-border-hover hover:bg-surface-elevated",
      ].join(" ")}
    >
      <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-[4px] bg-surface-elevated sm:w-[60px]">
        {cover ? (
          <CdnImage src={cover} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-text-muted" aria-hidden>
            <Mic size={20} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="truncate text-[12px] font-medium text-text-muted">{eyebrow}</p> : null}
        <p className="mt-0.5 line-clamp-2 break-words text-[15px] font-bold leading-snug text-text">{title}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[12px] font-medium text-text-muted">
          {podcast.runtime ? <span>{podcast.runtime}</span> : null}
          {podcast.is_free ? (
            <span className="rounded-sm bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-success">
              {t("podcastFree")}
            </span>
          ) : null}
        </div>
      </div>

      <span
        aria-hidden
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
          isSelected
            ? "bg-brand text-white"
            : locked
              ? "border border-border text-text-muted group-hover:border-border-hover group-hover:text-text"
              : "bg-surface-elevated text-text group-hover:bg-text group-hover:text-bg",
        ].join(" ")}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isSelected ? (
          <Headphones size={16} />
        ) : locked ? (
          <Lock size={15} />
        ) : (
          <Play size={16} fill="currentColor" className="translate-x-px" />
        )}
      </span>
      <span className="sr-only">{locked ? t("podcastPlanOnly") : t("podcastPlay")}</span>
    </button>
  );
}
