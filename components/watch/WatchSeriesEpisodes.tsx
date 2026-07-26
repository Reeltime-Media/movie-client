"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { GenreFilterSelect } from "@/components/catalog/GenreFilterSelect";
import { useI18n } from "@/components/providers/LocaleProvider";
import type { SeasonRead } from "@/lib/api/types";
import { seriesPricingHref } from "@/lib/series-pricing";

export function WatchSeriesEpisodes({
  seriesSlug,
  seriesTitle,
  seasons,
  activeSeason,
  activeEpisode,
  hasSubscription = false,
  isAdmin = false,
  onEpisodeHover,
}: {
  seriesSlug: string;
  seriesTitle: string;
  seasons: SeasonRead[];
  activeSeason: number;
  activeEpisode: number;
  hasSubscription?: boolean;
  isAdmin?: boolean;
  /** Warm the stream URL when a playable episode is hovered/focused. */
  onEpisodeHover?: (episodeId: string) => void;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const seasonData = seasons.find((s) => s.season_number === activeSeason);
  const episodes = seasonData?.episodes ?? [];

  const seasonOptions = seasons.map((s) => ({
    value: String(s.season_number),
    label: `${t("watchSeasonLabel")} ${s.season_number}`,
  }));

  if (seasons.length === 0) return null;

  return (
    <div>
      <div className="mb-4 max-w-45">
        <GenreFilterSelect
          label={t("watchSeasonLabel")}
          value={String(activeSeason)}
          onChange={(value) => router.push(`/watch/series/${seriesSlug}/${value}/1`)}
          options={seasonOptions}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {episodes.map((ep) => {
          const epNum = ep.episode_number ?? 0;
          const isActive = epNum === activeEpisode;
          const isFree = ep.is_free === true;
          const canWatch = isFree || hasSubscription || isAdmin;
          const href = canWatch
            ? `/watch/series/${seriesSlug}/${activeSeason}/${epNum}`
            : seriesPricingHref({
                slug: seriesSlug,
                title: seriesTitle,
                season: activeSeason,
                episode: epNum,
              });

          return (
            <Link
              key={epNum}
              href={href}
              onMouseEnter={canWatch && onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
              onFocus={canWatch && onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
              className={[
                "flex min-h-12 items-center gap-2.5 rounded-md px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
                isActive
                  ? "bg-brand text-white"
                  : "bg-surface-elevated text-text hover:bg-border",
              ].join(" ")}
            >
              {canWatch ? (
                <Play size={14} className="shrink-0 fill-current" aria-hidden />
              ) : (
                <Lock size={14} className="shrink-0" aria-hidden />
              )}
              <span className="truncate">
                {t("watchEpisodeLabel")} {epNum}: {ep.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
