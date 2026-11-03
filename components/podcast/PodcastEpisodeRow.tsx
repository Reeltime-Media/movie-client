"use client";

import { Headphones, Loader2, Lock, Mic, Play } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterThumbUrl } from "@/lib/api/core";
import type { ContentListItemRead } from "@/lib/api/types";
import { podcastTitles } from "@/lib/podcast-access";

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
  const { t, locale } = useI18n();
  const { primary, secondary } = podcastTitles(podcast, locale);
  const cover = posterThumbUrl(podcast.poster_key, 400, podcast.updated_at);
  const description = podcast.description?.trim() || null;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(podcast)}
      className={[
        "rt-card-hover group flex w-full items-center gap-3 rounded-md border bg-surface p-2.5 text-left transition-colors sm:gap-4 sm:p-3",
        isSelected ? "border-brand ring-1 ring-brand/40" : "border-border hover:border-border-hover",
      ].join(" ")}
    >
      <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-[4px] bg-surface-elevated sm:w-16">
        {cover ? (
          <CdnImage
            src={cover}
            alt=""
            fill
            sizes="64px"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-text-muted" aria-hidden>
            <Mic size={20} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words text-[14px] font-bold leading-snug text-text">{primary}</p>
        {secondary ? (
          <p className="mt-0.5 truncate text-[12px] font-medium text-text-muted">{secondary}</p>
        ) : null}
        {description ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-text-disabled">
            {description}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {podcast.runtime ? <span className="text-text-muted">{podcast.runtime}</span> : null}
          {podcast.is_free ? (
            <span className="rounded-sm bg-success/15 px-1.5 py-0.5 text-success">
              {t("podcastFree")}
            </span>
          ) : !isEntitled ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-surface-elevated px-1.5 py-0.5 text-text-muted">
              <Lock size={10} aria-hidden />
              {t("podcastPlanOnly")}
            </span>
          ) : null}
        </div>
      </div>

      <span
        aria-hidden
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
          isSelected ? "bg-brand text-white" : "bg-surface-elevated text-text group-hover:bg-brand group-hover:text-white",
        ].join(" ")}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isSelected ? (
          <Headphones size={16} />
        ) : (
          <Play size={16} className="translate-x-px" />
        )}
      </span>
      <span className="sr-only">{t("podcastPlay")}</span>
    </button>
  );
}
