"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { youtubeHeroEmbedUrl } from "@/lib/youtube";

/** Hard cap so the carousel never stalls if end events are missed. */
const MAX_PLAY_MS = 120_000;
/** Delay before the video fades in over the banner image. */
const FADE_IN_DELAY_MS = 1_000;

type HeroVideoProps = {
  videoSrc: string | null;
  youtubeUrl: string | null;
  onEnded: () => void;
  onError: () => void;
};

/**
 * Video layer for the active hero slide. Renders an uploaded MP4/WebM via a
 * native <video>, or a YouTube nocookie embed. Autoplays muted; reports when
 * playback finishes or fails so the carousel can advance or fall back.
 */
export function HeroVideo({ videoSrc, youtubeUrl, onEnded, onError }: HeroVideoProps) {
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const endedRef = useRef(false);

  const embedUrl = videoSrc ? null : youtubeHeroEmbedUrl(youtubeUrl);

  const fireEnded = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEnded();
  }, [onEnded]);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), FADE_IN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(fireEnded, MAX_PLAY_MS);
    return () => window.clearTimeout(id);
  }, [fireEnded]);

  // YouTube IFrame messaging: subscribe to state events, detect video end (state 0).
  useEffect(() => {
    if (!embedUrl) return;

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube")) return;
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data) as {
          event?: string;
          info?: number | { playerState?: number };
        };
        const state =
          data.event === "onStateChange"
            ? data.info
            : data.event === "infoDelivery" && typeof data.info === "object"
              ? data.info?.playerState
              : undefined;
        if (state === 0) fireEnded();
      } catch {
        // Non-JSON messages from other embeds — ignore.
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [embedUrl, fireEnded]);

  const postToYoutube = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    );
  }, []);

  const subscribeToYoutube = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: "rt-hero" }),
      "*",
    );
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
    if (embedUrl) postToYoutube(next ? "mute" : "unMute");
  };

  if (!videoSrc && !embedUrl) return null;

  return (
    <div
      className={[
        "absolute inset-0 transition-opacity duration-700 ease-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={fireEnded}
          onError={onError}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        // 16:9 iframe scaled up to cover the 12:5 hero without letterboxing.
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={embedUrl ?? undefined}
            title="Hero video"
            allow="autoplay; encrypted-media"
            onLoad={subscribeToYoutube}
            onError={onError}
            className="absolute left-1/2 top-1/2 aspect-video h-[140%] -translate-x-1/2 -translate-y-1/2 border-0"
          />
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-4 right-4 z-10 flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:bottom-6 sm:right-6"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}
