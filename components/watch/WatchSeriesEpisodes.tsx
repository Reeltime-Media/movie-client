"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { SeriesUnlockBakongCheckoutModal } from "@/components/pay/SeriesUnlockBakongCheckoutModal";
import { useI18n } from "@/components/providers/LocaleProvider";
import type { SeasonRead } from "@/lib/api/types";
import { contentIdsMatch, findEpisodeByContentId } from "@/lib/watch/series-progress";

export function WatchSeriesEpisodes({
  seriesSlug,
  seriesTitle,
  seasons,
  activeSeason,
  activeEpisode,
  hasSubscription = false,
  isAdmin = false,
  onEpisodeHover,
  lastWatchedEpisodeId = null,
  episodeWatchProgress,
  loggedIn = false,
  className = "",
}: {
  seriesSlug: string;
  seriesTitle: string;
  seasons: SeasonRead[];
  activeSeason: number;
  activeEpisode: number;
  hasSubscription?: boolean;
  isAdmin?: boolean;
  onEpisodeHover?: (episodeId: string) => void;
  /** Most recently watched episode in this series (logged-in viewers). */
  lastWatchedEpisodeId?: string | null;
  /** 0–1 watch progress per episode id (logged-in viewers). */
  episodeWatchProgress?: Map<string, number>;
  loggedIn?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [checkoutEpisode, setCheckoutEpisode] = useState<number | null>(null);

  const seasonData = seasons.find((s) => s.season_number === activeSeason);
  const episodes = useMemo(
    () =>
      [...(seasonData?.episodes ?? [])].sort(
        (a, b) => (a.episode_number ?? 0) - (b.episode_number ?? 0),
      ),
    [seasonData],
  );

  const activeIndex = episodes.findIndex((ep) => ep.episode_number === activeEpisode);
  const activePosition = activeIndex >= 0 ? activeIndex + 1 : activeEpisode;
  const totalEpisodes = episodes.length;

  if (seasons.length === 0) return null;

  function handleLockedEpisodeClick(epNum: number) {
    setCheckoutEpisode(epNum);
  }

  const headerLabel = t("watchEpisodesProgress")
    .replace("{current}", String(activePosition))
    .replace("{total}", String(totalEpisodes));

  const lastWatchedLocation = lastWatchedEpisodeId
    ? findEpisodeByContentId(seasons, lastWatchedEpisodeId)
    : null;
  const lastWatchedInOtherSeason =
    lastWatchedLocation != null && lastWatchedLocation.seasonNumber !== activeSeason;

  const hasAnyTrackedProgress =
    lastWatchedEpisodeId != null ||
    (episodeWatchProgress != null && episodeWatchProgress.size > 0);

  return (
    <div className={["flex flex-col", className].filter(Boolean).join(" ")}>
      {seasons.length > 1 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {seasons.map((s) => {
            const selected = s.season_number === activeSeason;
            return (
              <button
                key={s.season_number}
                type="button"
                onClick={() => router.push(`/watch/series/${seriesSlug}/${s.season_number}/1`)}
                className={[
                  "rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors",
                  selected
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-text-muted hover:border-border-hover hover:text-text",
                ].join(" ")}
              >
                {t("watchSeasonLabel")} {s.season_number}
              </button>
            );
          })}
        </div>
      ) : null}

      {lastWatchedInOtherSeason && lastWatchedLocation ? (
        <Link
          href={`/watch/series/${seriesSlug}/${lastWatchedLocation.seasonNumber}/${lastWatchedLocation.episodeNumber}`}
          className="mb-2 block rounded-md border border-success/40 bg-success/10 px-3 py-2 text-[12px] font-semibold text-success transition-colors hover:bg-success/15"
        >
          {t("watchEpisodeContinueAt")
            .replace("{season}", String(lastWatchedLocation.seasonNumber))
            .replace("{episode}", String(lastWatchedLocation.episodeNumber))}
        </Link>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border bg-surface-elevated px-3 py-2.5">
          <p className="text-[13px] font-bold text-text">{headerLabel}</p>
          {totalEpisodes > 0 ? (
            <p className="mt-0.5 text-[11px] font-semibold text-brand">
              1–{totalEpisodes}
            </p>
          ) : null}
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto p-3">
          <div className="grid grid-cols-5 gap-2">
            {episodes.map((ep) => {
              const epNum = ep.episode_number ?? 0;
              const isActive = epNum === activeEpisode;
              const isLastWatched =
                lastWatchedEpisodeId != null && contentIdsMatch(lastWatchedEpisodeId, ep.id);
              const isFree = ep.is_free === true;
              const canWatch = isFree || hasSubscription || isAdmin;
              const watchedFraction = episodeWatchProgress?.get(ep.id) ?? 0;

              const cellClass = [
                "relative flex aspect-square cursor-pointer items-center justify-center rounded-md border text-[13px] font-bold transition-colors",
                isActive && isLastWatched
                  ? "border-brand bg-brand text-white ring-2 ring-success ring-offset-1 ring-offset-surface"
                  : isActive
                    ? "border-brand bg-brand text-white"
                    : isLastWatched
                      ? "border-success bg-surface-elevated text-text ring-2 ring-success/70 ring-offset-1 ring-offset-surface"
                      : canWatch
                      ? "border-border bg-surface-elevated text-text hover:border-border-hover"
                      : "border-border bg-surface-elevated text-text-muted hover:border-border-hover",
              ].join(" ");

              const lastWatchedLabel = t("watchEpisodeLastWatched");

              const inner = (
                <>
                  {!canWatch ? (
                    <Lock
                      size={11}
                      className="absolute right-1 top-1 text-brand"
                      aria-hidden
                    />
                  ) : null}
                  {isLastWatched ? (
                    <span
                      className="absolute inset-x-0 top-0 z-[1] truncate rounded-t-[5px] bg-success px-1 py-0.5 text-center text-[9px] font-bold leading-tight text-white shadow-sm"
                      title={lastWatchedLabel}
                    >
                      {isActive ? t("watchEpisodeContinue") : t("watchEpisodeLastWatchedShort")}
                    </span>
                  ) : null}
                  <span className={isLastWatched ? "mt-2" : undefined}>{epNum}</span>
                  {watchedFraction > 0 ? (
                    <span
                      className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-black/25"
                      aria-hidden
                    >
                      <span
                        className="block h-full rounded-full bg-success"
                        style={{ width: `${Math.round(watchedFraction * 100)}%` }}
                      />
                    </span>
                  ) : isActive ? (
                    <span
                      className="absolute bottom-1.5 flex gap-0.5"
                      aria-hidden
                    >
                      <span className="h-2 w-0.5 rounded-full bg-white/90" />
                      <span className="h-3 w-0.5 rounded-full bg-white/90" />
                      <span className="h-1.5 w-0.5 rounded-full bg-white/90" />
                    </span>
                  ) : null}
                </>
              );

              if (canWatch) {
                return (
                  <Link
                    key={ep.id}
                    href={`/watch/series/${seriesSlug}/${activeSeason}/${epNum}`}
                    onMouseEnter={onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
                    onFocus={onEpisodeHover ? () => onEpisodeHover(ep.id) : undefined}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={
                      isLastWatched ? `${t("watchEpisodeLabel")} ${epNum}, ${lastWatchedLabel}` : undefined
                    }
                    className={cellClass}
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => handleLockedEpisodeClick(epNum)}
                  aria-label={
                    isLastWatched ? `${t("watchEpisodeLabel")} ${epNum}, ${lastWatchedLabel}` : undefined
                  }
                  className={cellClass}
                >
                  {inner}
                </button>
              );
            })}
          </div>
          {hasAnyTrackedProgress ? (
            <p className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
              <span className="h-2 w-2 shrink-0 rounded-sm border-2 border-success bg-surface-elevated" aria-hidden />
              {t("watchEpisodeLastWatched")}
            </p>
          ) : !loggedIn ? (
            <p className="mt-3 text-[10px] font-medium text-text-muted">
              {t("watchEpisodeProgressSignIn")}
            </p>
          ) : null}
        </div>
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
