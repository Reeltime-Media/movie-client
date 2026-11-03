"use client";

import { AlertCircle, Loader2, LogIn, Lock, Mic, X } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PodcastEpisodeRow } from "@/components/podcast/PodcastEpisodeRow";
import { useI18n } from "@/components/providers/LocaleProvider";
import { CdnImage } from "@/components/ui/CdnImage";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { posterThumbUrl, posterUrl } from "@/lib/api/core";
import { authorizePodcastAudio } from "@/lib/api/podcasts";
import { hasActiveSubscription, listMySubscriptions } from "@/lib/api/subscriptions";
import type { ContentListItemRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { loginPathWithNext } from "@/lib/auth-redirect";
import { swallow } from "@/lib/log";
import { podcastLockReason, podcastTitles } from "@/lib/podcast-access";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

type Selection =
  | { status: "idle" }
  | { status: "authorizing"; podcast: ContentListItemRead }
  | { status: "playing"; podcast: ContentListItemRead; url: string }
  | { status: "locked"; podcast: ContentListItemRead; reason: "signin" | "subscribe" }
  | { status: "not-ready"; podcast: ContentListItemRead }
  | { status: "error"; podcast: ContentListItemRead; message: string };

function StatusPanel({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-elevated text-text-muted">
        {icon}
      </div>
      <p className="text-[15px] font-bold text-text">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-text-muted">{desc}</p>
      {action}
    </div>
  );
}

function PlayerBand({
  selection,
  onClose,
  onRetry,
  onAudioError,
}: {
  selection: Exclude<Selection, { status: "idle" }>;
  onClose: () => void;
  onRetry: (podcast: ContentListItemRead) => void;
  onAudioError: (podcast: ContentListItemRead) => void;
}) {
  const { t, locale } = useI18n();
  const { podcast } = selection;
  const { primary, secondary } = podcastTitles(podcast, locale);
  const cover = posterThumbUrl(podcast.poster_key, 400, podcast.updated_at);
  const playingUrl = selection.status === "playing" ? selection.url : null;

  // Lock-screen / headset controls show the episode name and cover.
  useEffect(() => {
    if (!playingUrl || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const artwork = posterUrl(podcast.poster_key, podcast.updated_at);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: primary,
      artist: secondary ?? "Reeltime",
      artwork: artwork ? [{ src: artwork, sizes: "800x1200" }] : [],
    });
    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [playingUrl, podcast.poster_key, podcast.updated_at, primary, secondary]);

  return (
    <section id="podcast-player" className="rt-page-fade-up scroll-mt-24 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-[4px] bg-surface-elevated sm:w-24">
            {cover ? (
              <CdnImage src={cover} alt="" fill sizes="96px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-text-muted" aria-hidden>
                <Mic size={24} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand">
              {t("podcastNowPlaying")}
            </p>
            <h2 className="mt-1 text-[16px] font-bold leading-snug text-text">{primary}</h2>
            {secondary ? (
              <p className="mt-0.5 text-[12px] font-medium text-text-muted">{secondary}</p>
            ) : null}
            {podcast.runtime ? (
              <p className="mt-1 text-[12px] text-text-disabled">{podcast.runtime}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {selection.status === "authorizing" ? (
          <div className="flex items-center justify-center gap-2 py-4 text-[13px] font-medium text-text-muted">
            <Loader2 size={18} className="animate-spin" aria-hidden />
            {t("podcastConnecting")}
          </div>
        ) : selection.status === "playing" ? (
          <audio
            key={selection.url}
            controls
            autoPlay
            preload="auto"
            src={selection.url}
            className="w-full"
            onError={() => onAudioError(podcast)}
          />
        ) : selection.status === "locked" ? (
          <StatusPanel
            icon={
              selection.reason === "signin" ? <LogIn size={20} aria-hidden /> : <Lock size={20} aria-hidden />
            }
            title={selection.reason === "signin" ? t("podcastSignInTitle") : t("podcastSubscribeTitle")}
            desc={selection.reason === "signin" ? t("podcastSignInDesc") : t("podcastSubscribeDesc")}
            action={
              <Link
                href={selection.reason === "signin" ? loginPathWithNext("/podcasts") : "/pricing"}
                className="mt-1 inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                {selection.reason === "signin" ? t("podcastSignInCta") : t("podcastSubscribeCta")}
              </Link>
            }
          />
        ) : selection.status === "not-ready" ? (
          <StatusPanel
            icon={<Mic size={20} aria-hidden />}
            title={t("podcastNotReadyTitle")}
            desc={t("podcastNotReadyDesc")}
          />
        ) : (
          <StatusPanel
            icon={<AlertCircle size={20} className="text-danger" aria-hidden />}
            title={t("podcastErrorTitle")}
            desc={selection.message}
            action={
              <button
                type="button"
                onClick={() => onRetry(podcast)}
                className="mt-1 rounded-md border border-border bg-surface-elevated px-4 py-2 text-[13px] font-bold text-text transition-colors hover:border-border-hover"
              >
                {t("podcastRetry")}
              </button>
            }
          />
        )}
      </div>
    </section>
  );
}

export function PodcastView({ podcasts }: { podcasts: ContentListItemRead[] }) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selection, setSelection] = useState<Selection>({ status: "idle" });
  const selectionGenRef = useRef(0);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    listMySubscriptions()
      .catch(swallow("podcasts: load subscriptions", []))
      .then((subs) => {
        if (!cancelled) setHasSubscription(hasActiveSubscription(subs));
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const isEntitled = useCallback(
    (podcast: ContentListItemRead) =>
      podcastLockReason({ isFree: podcast.is_free, loggedIn, hasSubscription, isAdmin }) === null,
    [loggedIn, hasSubscription, isAdmin],
  );

  // The API decides who may listen (it answers 403 otherwise); the badges
  // above only mirror its rule so the list can show a lock before a click.
  const selectPodcast = useCallback(
    (podcast: ContentListItemRead) => {
      const gen = ++selectionGenRef.current;
      setSelection({ status: "authorizing", podcast });
      authorizePodcastAudio(podcast.id)
        .then((url) => {
          if (gen !== selectionGenRef.current) return;
          setSelection({ status: "playing", podcast, url });
        })
        .catch((err: unknown) => {
          if (gen !== selectionGenRef.current) return;
          const statusCode =
            err && typeof err === "object" && "status" in err
              ? Number((err as { status: unknown }).status)
              : 0;
          if (statusCode === 403) {
            setSelection({ status: "locked", podcast, reason: loggedIn ? "subscribe" : "signin" });
          } else if (statusCode === 409) {
            setSelection({ status: "not-ready", podcast });
          } else {
            setSelection({
              status: "error",
              podcast,
              message: err instanceof Error ? err.message : t("podcastErrorDesc"),
            });
          }
        });
    },
    [loggedIn, t],
  );

  // The audio file itself failed to load (expired link, network): show the
  // error panel with a retry that asks the API for a fresh URL.
  const handleAudioError = useCallback(
    (podcast: ContentListItemRead) => {
      setSelection({ status: "error", podcast, message: t("podcastErrorDesc") });
    },
    [t],
  );

  const closePlayer = useCallback(() => {
    selectionGenRef.current += 1;
    setSelection({ status: "idle" });
  }, []);

  const selectedId = selection.status === "idle" ? null : selection.podcast.id;

  // Bring the player into view when an episode is selected.
  useEffect(() => {
    if (!selectedId) return;
    document.getElementById("podcast-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  const episodeCount = useMemo(
    () => t("podcastEpisodeCount").replace("{count}", String(podcasts.length)),
    [podcasts.length, t],
  );

  return (
    <PageShell fullWidth>
      <header className="border-b border-border px-4 py-8 sm:px-6 md:px-8">
        <span
          className={["rt-page-fade-up mb-3 w-fit", kickerBadgeClassName].join(" ")}
          style={{ "--rt-enter-delay": "40ms" } as CSSProperties}
        >
          {t("podcastBadge")}
        </span>
        <h1
          className="rt-page-fade-up text-balance text-[28px] font-extrabold tracking-[-0.02em] text-text md:text-[32px]"
          style={{ "--rt-enter-delay": "80ms" } as CSSProperties}
        >
          {t("podcastHeroTitle")}
        </h1>
        <p
          className="rt-page-fade-up mt-2 max-w-xl text-[13px] leading-relaxed text-text-muted"
          style={{ "--rt-enter-delay": "140ms" } as CSSProperties}
        >
          {t("podcastHeroDesc")}
        </p>
      </header>

      {selection.status !== "idle" ? (
        <PlayerBand
          selection={selection}
          onClose={closePlayer}
          onRetry={selectPodcast}
          onAudioError={handleAudioError}
        />
      ) : null}

      <section
        id="podcast-episodes"
        className="rt-page-fade-up px-4 py-6 sm:px-6 md:px-8"
        style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
      >
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">
              {t("podcastSectionAll")}
            </h2>
            {podcasts.length > 0 ? (
              <span className="text-[12px] font-medium text-text-muted">{episodeCount}</span>
            ) : null}
          </div>

          {podcasts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-surface-elevated text-text-muted">
                <Mic size={22} aria-hidden />
              </div>
              <p className="text-[14px] font-semibold text-text">{t("podcastEmptyTitle")}</p>
              <p className="max-w-sm text-[13px] leading-relaxed text-text-muted">
                {t("podcastEmptyDesc")}
              </p>
            </div>
          ) : (
            <>
              {selection.status === "idle" ? (
                <p className="mb-3 text-[12px] text-text-muted">{t("podcastSelectPrompt")}</p>
              ) : null}
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {podcasts.map((podcast) => (
                  <li key={podcast.id}>
                    <PodcastEpisodeRow
                      podcast={podcast}
                      isEntitled={isEntitled(podcast)}
                      isSelected={selectedId === podcast.id}
                      isLoading={selection.status === "authorizing" && selectedId === podcast.id}
                      onSelect={selectPodcast}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
