"use client";

import { Mic } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PodcastEpisodeRow } from "@/components/podcast/PodcastEpisodeRow";
import { PodcastPlayerPanel, type PodcastSelection } from "@/components/podcast/PodcastPlayerPanel";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { authorizePodcastAudio } from "@/lib/api/podcasts";
import { hasActiveSubscription, listMySubscriptions } from "@/lib/api/subscriptions";
import type { ContentListItemRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { swallow } from "@/lib/log";
import { podcastLockReason } from "@/lib/podcast-access";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

export function PodcastView({ podcasts }: { podcasts: ContentListItemRead[] }) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selection, setSelection] = useState<PodcastSelection>({ status: "idle" });
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

  // Below lg the player sits above the list: bring it into view on selection.
  // From lg up it is docked beside the list and already visible.
  useEffect(() => {
    if (!selectedId || window.matchMedia("(min-width: 1024px)").matches) return;
    document.getElementById("podcast-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  const episodeCount = useMemo(
    () => t("podcastEpisodeCount").replace("{count}", String(podcasts.length)),
    [podcasts.length, t],
  );

  // Locks only make sense to explain when this viewer actually sees some.
  const hasLockedEpisodes = podcasts.some((podcast) => !podcast.is_free && !isEntitled(podcast));
  const idle = selection.status === "idle";

  return (
    <PageShell fullWidth>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <header className="border-b border-border py-8 md:py-10">
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

        {podcasts.length === 0 ? (
          <div className="my-8 flex flex-col items-center gap-3 rounded-md border border-border bg-surface px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-surface-elevated text-text-muted">
              <Mic size={22} aria-hidden />
            </div>
            <p className="text-[14px] font-semibold text-text">{t("podcastEmptyTitle")}</p>
            <p className="max-w-sm text-[13px] leading-relaxed text-text-muted">{t("podcastEmptyDesc")}</p>
          </div>
        ) : (
          <div
            className="rt-page-fade-up grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8 lg:py-8"
            style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
          >
            {/* First in the DOM so it sits above the list on small screens. */}
            <div
              id="podcast-dock"
              className={["lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1", idle ? "hidden lg:block" : ""].join(
                " ",
              )}
            >
              <PodcastPlayerPanel
                selection={selection}
                onClose={closePlayer}
                onRetry={selectPodcast}
                onAudioError={handleAudioError}
              />
            </div>

            <section id="podcast-episodes" className="min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">{t("podcastSectionAll")}</h2>
                <span className="text-[12px] font-medium text-text-muted">{episodeCount}</span>
              </div>
              <p className="mb-4 text-[12px] text-text-muted">
                {hasLockedEpisodes ? t("podcastLockedHint") : t("podcastSelectPrompt")}
              </p>
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
            </section>
          </div>
        )}
      </div>
    </PageShell>
  );
}
