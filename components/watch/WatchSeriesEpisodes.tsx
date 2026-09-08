"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { useState } from "react";
import { GenreFilterSelect } from "@/components/catalog/GenreFilterSelect";
import { SeriesUnlockBakongCheckoutModal } from "@/components/pay/SeriesUnlockBakongCheckoutModal";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import type { SeasonRead } from "@/lib/api/types";

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
  const { loggedIn } = useAuth();
  const [checkoutEpisode, setCheckoutEpisode] = useState<number | null>(null);
  const seasonData = seasons.find((s) => s.season_number === activeSeason);
  const episodes = seasonData?.episodes ?? [];

  const seasonOptions = seasons.map((s) => ({
    value: String(s.season_number),
    label: `${t("watchSeasonLabel")} ${s.season_number}`,
  }));

  if (seasons.length === 0) return null;

  function handleLockedEpisodeClick(epNum: number) {
    if (!loggedIn) {
      router.push(
        `/login?next=${encodeURIComponent(`/watch/series/${seriesSlug}/${activeSeason}/${epNum}`)}`,
      );
      return;
    }
    setCheckoutEpisode(epNum);
  }

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
          const itemClassName = [
            "flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-md px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors",
            isActive ? "bg-brand text-white" : "bg-surface-elevated text-text hover:bg-border",
          ].join(" ");
          const icon = canWatch ? (
            <Play size={14} className="shrink-0 fill-current" aria-hidden />
          ) : (
            <Lock size={14} className="shrink-0" aria-hidden />
          );
          const label = (
            <span className="truncate">
              {t("watchEpisodeLabel")} {epNum}: {ep.title}
            </span>
          );

          if (canWatch) {
            return (
              <Link
                key={epNum}
                href={`/watch/series/${seriesSlug}/${activeSeason}/${epNum}`}
                onMouseEnter={onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
                onFocus={onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
                className={itemClassName}
              >
                {icon}
                {label}
              </Link>
            );
          }

          return (
            <button
              key={epNum}
              type="button"
              onClick={() => handleLockedEpisodeClick(epNum)}
              className={itemClassName}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      {checkoutEpisode !== null ? (
        <SeriesUnlockBakongCheckoutModal
          seriesSlug={seriesSlug}
          title={seriesTitle}
          watchHref={`/watch/series/${seriesSlug}/${activeSeason}/${checkoutEpisode}`}
          onClose={() => setCheckoutEpisode(null)}
        />
      ) : null}
    </div>
  );
}
