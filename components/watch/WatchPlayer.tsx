"use client";

import Hls from "hls.js";
import {
  AlertCircle,
  EyeOff,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWatchProgressSync } from "@/hooks/watch/use-watch-progress-sync";
import { safePlay } from "@/lib/video/safe-play";

type QualityLevel = { height: number; bitrate: number; index: number };

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function WatchPlayer({
  contentId,
  hlsSrc,
  fallbackSrc,
  title,
  attribution,
  bleed = false,
}: {
  /** When set, saves resume progress for logged-in users (≥30s or 10% watched). */
  contentId?: string;
  hlsSrc: string;
  fallbackSrc?: string;
  title: string;
  attribution?: string;
  bleed?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(-1); // -1 = Auto
  const [autoLevel, setAutoLevel] = useState(-1);
  const [showQuality, setShowQuality] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [obscured, setObscured] = useState(false);

  const { markCompleted, flushProgress } = useWatchProgressSync({
    contentId,
    currentTime,
    duration,
  });

  // ── Init HLS ──────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setPlaying(false);
    setBuffering(true);
    setError(null);
    setLevels([]);
    setSelectedLevel(-1);
    setAutoLevel(-1);
    // Reset progress state so switching source (e.g. next episode) without a
    // remount doesn't briefly show the previous video's time/scrubber.
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(
          data.levels.map((l, i) => ({
            height: l.height || 0,
            bitrate: l.bitrate,
            index: i,
          })),
        );
        setBuffering(false);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setAutoLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError("Stream error — please refresh.");
      });

      return () => {
        video.pause();
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Native HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsSrc;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    // MP4 fallback
    if (fallbackSrc) {
      video.src = fallbackSrc;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }
  }, [hlsSrc, fallbackSrc]);

  // ── Video event listeners ──────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      flushProgress();
    };
    const onEnded = () => {
      setPlaying(false);
      markCompleted();
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [flushProgress, markCompleted]);

  // ── Fullscreen listener ────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      // Standard fullscreen API (Chrome/Firefox/desktop Safari)
      if (typeof document !== "undefined" && "fullscreenElement" in document) {
        setIsFullscreen(!!document.fullscreenElement);
        return;
      }
      setIsFullscreen(false);
    };

    const onDocChange = () => update();
    document.addEventListener("fullscreenchange", onDocChange);

    // iOS Safari fullscreen is video-only and does not reliably emit document.fullscreenchange.
    // Track video fullscreen via WebKit-specific events.
    const v = videoRef.current;
    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);
    v?.addEventListener?.("webkitbeginfullscreen" as any, onWebkitBegin as any);
    v?.addEventListener?.("webkitendfullscreen" as any, onWebkitEnd as any);

    update();
    return () => {
      document.removeEventListener("fullscreenchange", onDocChange);
      v?.removeEventListener?.("webkitbeginfullscreen" as any, onWebkitBegin as any);
      v?.removeEventListener?.("webkitendfullscreen" as any, onWebkitEnd as any);
    };
  }, []);

  // ── Obscure on blur/tab-switch ──────────────────────────────────
  // Weak deterrent only: browsers give pages no way to detect an actual
  // screenshot or screen recording. This just pauses and darkens the
  // frame when the tab loses focus/visibility (e.g. switching to a
  // recording tool's controls), which stops casual capture attempts
  // without doing anything for a determined user.
  useEffect(() => {
    const obscure = () => {
      const v = videoRef.current;
      if (v && !v.paused) v.pause();
      setObscured(true);
    };
    const onVisibility = () => {
      if (document.hidden) obscure();
    };
    window.addEventListener("blur", obscure);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", obscure);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ── Controls auto-hide ─────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setObscured(false);
    if (v.paused) {
      void safePlay(v);
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (v) v.muted = !v.muted;
  }, []);

  const changeVolume = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  }, []);

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    },
    [duration],
  );

  const changeQuality = useCallback((levelIndex: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = levelIndex;
    setSelectedLevel(levelIndex);
    setShowQuality(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current;
    const el = containerRef.current;
    if (!v || !el) return;

    // Exit if already fullscreen (standard API)
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    // Prefer putting the <video> element fullscreen on mobile (iOS Safari requirement).
    const anyVideo = v as any;
    if (typeof v.requestFullscreen === "function") {
      void v.requestFullscreen();
      return;
    }
    if (typeof anyVideo.webkitEnterFullscreen === "function") {
      anyVideo.webkitEnterFullscreen();
      return;
    }

    // Fallback to container fullscreen (some browsers allow this)
    if (typeof el.requestFullscreen === "function") {
      void el.requestFullscreen();
    }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 10);
      if (e.code === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 10);
      if (e.code === "KeyF") toggleFullscreen();
      if (e.code === "KeyM") toggleMute();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleFullscreen, toggleMute]);

  // ── Derived values ────────────────────────────────────────────
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  const qualityLabel =
    selectedLevel === -1
      ? autoLevel >= 0 && levels[autoLevel]
        ? `Auto · ${levels[autoLevel].height}p`
        : "Auto"
      : levels.find((l) => l.index === selectedLevel)?.height
        ? `${levels.find((l) => l.index === selectedLevel)!.height}p`
        : "Auto";

  return (
    <figure className="m-0">
      <div
        ref={containerRef}
        className={[
          "relative aspect-video w-full overflow-hidden bg-black",
          bleed ? "" : "rounded-md",
        ].join(" ")}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => { if (playing) setShowControls(false); }}
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Video element — no native controls */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload="auto"
          aria-label={`Video player: ${title}`}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Obscured on tab blur/switch — weak deterrent, see effect above */}
        {obscured && !error && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            <EyeOff size={28} className="text-white/50" />
            <p className="text-[12px] font-medium text-white/50">
              Paused — click to resume
            </p>
          </div>
        )}

        {/* Buffering spinner */}
        {buffering && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-white/60" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <AlertCircle size={36} className="text-danger" />
            <p className="text-[13px] font-medium text-white/80">{error}</p>
          </div>
        )}

        {/* Bottom gradient scrim */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 transition-opacity duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          }}
        />

        {/* Controls overlay */}
        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-3 transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Seek / progress bar */}
          <div
            className="group/seek relative mb-3 h-1 cursor-pointer rounded-full bg-white/20 hover:h-1.25"
            style={{ transition: "height 120ms ease" }}
            onClick={seek}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/25"
              style={{ width: `${bufferedPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{ width: `${progressPct}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
          </div>

          {/* Button row */}
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="text-white transition-opacity hover:opacity-75"
            >
              {playing ? (
                <Pause size={20} fill="white" strokeWidth={0} />
              ) : (
                <Play size={20} fill="white" strokeWidth={0} />
              )}
            </button>

            {/* Volume */}
            <div className="group/vol flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="text-white transition-opacity hover:opacity-75"
              >
                {muted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-0 cursor-pointer opacity-0 transition-all duration-200 group-hover/vol:w-16 group-hover/vol:opacity-100"
                style={{ accentColor: "#E50914" }}
                aria-label="Volume"
              />
            </div>

            {/* Time display */}
            <span className="tabular-nums text-[11px] font-medium text-white/75">
              {formatTime(currentTime)}{" "}
              <span className="text-white/40">/</span>{" "}
              {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Quality picker */}
            {levels.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQuality((v) => !v)}
                  className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Video quality"
                >
                  <Settings size={14} />
                  <span>{qualityLabel}</span>
                </button>

                {showQuality && (
                  <div className="absolute bottom-full right-0 mb-2 min-w-30 overflow-hidden rounded-md border border-white/10 bg-[#141414] py-1">
                    <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Quality
                    </div>

                    {/* Auto */}
                    <button
                      type="button"
                      onClick={() => changeQuality(-1)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      {selectedLevel === -1 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      )}
                      <span className={selectedLevel === -1 ? "text-brand" : ""}>Auto</span>
                      {selectedLevel === -1 && autoLevel >= 0 && levels[autoLevel] && (
                        <span className="ml-auto text-[10px] text-white/35">
                          {levels[autoLevel].height}p
                        </span>
                      )}
                    </button>

                    {/* Quality levels, highest first */}
                    {[...levels]
                      .sort((a, b) => b.height - a.height)
                      .map((l) => (
                        <button
                          key={l.index}
                          type="button"
                          onClick={() => changeQuality(l.index)}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                        >
                          {selectedLevel === l.index && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                          )}
                          <span className={selectedLevel === l.index ? "text-brand" : ""}>
                            {l.height > 0
                              ? `${l.height}p`
                              : `${Math.round(l.bitrate / 1000)}k`}
                          </span>
                          {selectedLevel !== l.index && (
                            <span className="ml-auto text-[10px] text-white/35">
                              {Math.round(l.bitrate / 1000)}k
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="text-white/75 transition-colors hover:text-white"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {attribution ? (
        <figcaption className="sr-only">{attribution}</figcaption>
      ) : null}
    </figure>
  );
}
