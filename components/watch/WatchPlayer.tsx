"use client";

import Hls from "hls.js";
import {
  AlertCircle,
  Gauge,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWatchProgressSync } from "@/hooks/watch/use-watch-progress-sync";
import { safePlay } from "@/lib/video/safe-play";

type QualityLevel = { height: number; bitrate: number; index: number };

function qualityHeightLabel(height: number): string {
  if (height >= 2160) return "4K";
  if (height > 0) return `${height}p`;
  return "";
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const REWIND_SECONDS = 10;

/** Safari (incl. iOS) gates PiP behind webkit-prefixed APIs on some versions. */
type PipVideo = HTMLVideoElement & {
  webkitSupportsPresentationMode?: (mode: string) => boolean;
  webkitSetPresentationMode?: (mode: "picture-in-picture" | "inline") => void;
  webkitPresentationMode?: string;
};

/** iOS/iPadOS — Fullscreen API on a div is a no-op; only <video>.webkitEnterFullscreen works. */
type WebkitVideo = HTMLVideoElement & {
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
};

function isAppleTouchDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

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
  fill = false,
  initialTime = 0,
}: {
  contentId?: string;
  hlsSrc: string;
  fallbackSrc?: string;
  title: string;
  attribution?: string;
  bleed?: boolean;
  /** Stretch to parent height instead of locking to 16:9 (series theater). */
  fill?: boolean;
  /** Resume position in seconds (skipped when 0). */
  initialTime?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const bufferedBarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLSpanElement>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const bufferedEndRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastDisplayTickRef = useRef(0);
  const pendingSeekRef = useRef(initialTime > 0 ? initialTime : null);
  const hasStartedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [autoLevel, setAutoLevel] = useState(-1);
  const [showQuality, setShowQuality] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** CSS immersive fallback when Fullscreen API isn't available (e.g. iOS Safari). */
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preloadMode, setPreloadMode] = useState<"metadata" | "auto">("metadata");

  const getPosition = useCallback(() => currentTimeRef.current, []);
  const getDuration = useCallback(() => durationRef.current, []);

  const { markCompleted, flushProgress } = useWatchProgressSync({
    contentId,
    getPosition,
    getDuration,
  });

  const updateProgressUi = useCallback(() => {
    const dur = durationRef.current;
    const current = currentTimeRef.current;
    const buffered = bufferedEndRef.current;
    const progressPct = dur > 0 ? (current / dur) * 100 : 0;
    const bufferedPct = dur > 0 ? (buffered / dur) * 100 : 0;

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressPct}%`;
    }
    if (bufferedBarRef.current) {
      bufferedBarRef.current.style.width = `${bufferedPct}%`;
    }
    if (thumbRef.current) {
      thumbRef.current.style.left = `calc(${progressPct}% - 6px)`;
    }

    const now = performance.now();
    if (now - lastDisplayTickRef.current >= 1000) {
      lastDisplayTickRef.current = now;
      const formatted = `${formatTime(current)} / ${formatTime(dur)}`;
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatted;
      }
      setDisplayTime(current);
    }
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      const video = videoRef.current;
      if (video) {
        currentTimeRef.current = video.currentTime;
        if (video.buffered.length > 0) {
          bufferedEndRef.current = video.buffered.end(video.buffered.length - 1);
        }
        updateProgressUi();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, updateProgressUi]);

  const applyPendingSeek = useCallback(() => {
    const video = videoRef.current;
    const seekTo = pendingSeekRef.current;
    if (!video || seekTo === null || seekTo <= 0) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = Math.min(seekTo, video.duration - 1);
    currentTimeRef.current = video.currentTime;
    pendingSeekRef.current = null;
    updateProgressUi();
  }, [updateProgressUi]);

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
    setDuration(0);
    setDisplayTime(0);
    currentTimeRef.current = 0;
    durationRef.current = 0;
    bufferedEndRef.current = 0;
    pendingSeekRef.current = initialTime > 0 ? initialTime : null;
    hasStartedRef.current = false;
    setPreloadMode("metadata");
    updateProgressUi();

    // Prefer native HLS on Apple devices so webkitEnterFullscreen works.
    // hls.js (MSE) can claim support on some iPads but breaks iOS fullscreen.
    if (
      isAppleTouchDevice() &&
      video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      video.src = hlsSrc;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
        // Fetch the first fragment as soon as the manifest is known, in parallel
        // with media attach, so the first frame paints sooner.
        startFragPrefetch: true,
      });
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
        applyPendingSeek();
        // Browsers block unmuted autoplay; start muted (existing mute button
        // lets the viewer unmute) so playback actually starts on navigation.
        video.muted = true;
        void safePlay(video);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setAutoLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        setError("Stream error — please refresh.");
      });

      return () => {
        video.pause();
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsSrc;
      video.muted = true;
      void safePlay(video);
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    if (fallbackSrc) {
      video.src = fallbackSrc;
      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }
  }, [hlsSrc, fallbackSrc, initialTime, applyPendingSeek, updateProgressUi]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setPlaying(true);
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        setPreloadMode("auto");
      }
      startRaf();
    };
    const onPause = () => {
      setPlaying(false);
      stopRaf();
      flushProgress();
      updateProgressUi();
    };
    const onEnded = () => {
      setPlaying(false);
      stopRaf();
      markCompleted();
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => {
      setBuffering(false);
      applyPendingSeek();
    };
    const onDurationChange = () => {
      durationRef.current = video.duration;
      setDuration(video.duration);
      applyPendingSeek();
      updateProgressUi();
    };
    const onVolumeChange = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };
    const onLoadedMetadata = () => applyPendingSeek();

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      stopRaf();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [
    flushProgress,
    markCompleted,
    startRaf,
    stopRaf,
    applyPendingSeek,
    updateProgressUi,
  ]);

  useEffect(() => {
    const update = () => {
      const video = videoRef.current as WebkitVideo | null;
      const nativeFs =
        typeof document !== "undefined" &&
        !!(
          document.fullscreenElement ||
          (document as Document & { webkitFullscreenElement?: Element | null })
            .webkitFullscreenElement ||
          video?.webkitDisplayingFullscreen
        );
      setIsFullscreen(nativeFs || cssFullscreen);
    };

    const onDocChange = () => update();
    document.addEventListener("fullscreenchange", onDocChange);
    document.addEventListener("webkitfullscreenchange", onDocChange as EventListener);

    const video = videoRef.current;
    video?.addEventListener("webkitbeginfullscreen", onDocChange);
    video?.addEventListener("webkitendfullscreen", onDocChange);

    update();
    return () => {
      document.removeEventListener("fullscreenchange", onDocChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onDocChange as EventListener,
      );
      video?.removeEventListener("webkitbeginfullscreen", onDocChange);
      video?.removeEventListener("webkitendfullscreen", onDocChange);
    };
  }, [cssFullscreen]);

  // Sync the PiP button when the user exits via the browser's own floating
  // window (rather than our button), or via Safari's presentation-mode API.
  useEffect(() => {
    const video = videoRef.current as PipVideo | null;
    if (!video) return;

    // Hide the button in browsers without any PiP API (e.g. Firefox).
    setPipSupported(
      (document.pictureInPictureEnabled ?? false) ||
        video.webkitSupportsPresentationMode?.("picture-in-picture") === true,
    );

    const onEnter = () => setPipActive(true);
    const onLeave = () => setPipActive(false);
    const onPresentationModeChange = () => {
      setPipActive(video.webkitPresentationMode === "picture-in-picture");
    };

    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);
    video.addEventListener("webkitpresentationmodechanged", onPresentationModeChange);

    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
      video.removeEventListener("webkitpresentationmodechanged", onPresentationModeChange);
    };
  }, []);

  // Lock page scroll + reparent player shell to <body> for CSS immersive.
  // iOS Safari traps position:fixed inside overflow-x:hidden ancestors
  // (PageShell / WatchPlayerFrame), so fixed inset-0 looks like a no-op.
  useLayoutEffect(() => {
    if (!cssFullscreen) return;
    const el = containerRef.current;
    const html = document.documentElement;
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    html.dataset.watchImmersive = "1";

    let placeholder: HTMLDivElement | null = null;
    if (el?.parentElement) {
      placeholder = document.createElement("div");
      placeholder.setAttribute("data-watch-fs-ph", "");
      placeholder.style.cssText = "display:block;width:100%;height:100%;";
      el.parentElement.insertBefore(placeholder, el);
      document.body.appendChild(el);
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      delete html.dataset.watchImmersive;
      if (el && placeholder?.parentElement) {
        placeholder.parentElement.insertBefore(el, placeholder);
        placeholder.remove();
      }
    };
  }, [cssFullscreen]);

  // When entering fullscreen, let hls.js pick higher rungs (player is now viewport-sized).
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.capLevelToPlayerSize = !isFullscreen;
  }, [isFullscreen]);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
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
      const dur = durationRef.current;
      if (!v || !dur) return;
      const rect = e.currentTarget.getBoundingClientRect();
      v.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
      currentTimeRef.current = v.currentTime;
      updateProgressUi();
    },
    [updateProgressUi],
  );

  const changeQuality = useCallback((levelIndex: number) => {
    if (hlsRef.current) hlsRef.current.currentLevel = levelIndex;
    setSelectedLevel(levelIndex);
    setShowQuality(false);
  }, []);

  const skip = useCallback(
    (deltaSeconds: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration)) return;
      v.currentTime = Math.min(Math.max(0, v.currentTime + deltaSeconds), v.duration);
      currentTimeRef.current = v.currentTime;
      updateProgressUi();
    },
    [updateProgressUi],
  );

  const changeSpeed = useCallback((rate: number) => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeed(false);
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current as PipVideo | null;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.webkitPresentationMode === "picture-in-picture") {
        video.webkitSetPresentationMode?.("inline");
      } else if (typeof video.requestPictureInPicture === "function") {
        await video.requestPictureInPicture();
      } else if (video.webkitSetPresentationMode) {
        video.webkitSetPresentationMode("picture-in-picture");
      }
    } catch {
      /* PiP can reject (e.g. no user gesture, unsupported media) — no-op. */
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const video = videoRef.current as WebkitVideo | null;
    if (!el) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => void;
    };
    const nativeFs = document.fullscreenElement || doc.webkitFullscreenElement;

    // Exit paths.
    if (video?.webkitDisplayingFullscreen) {
      video.webkitExitFullscreen?.();
      return;
    }
    if (nativeFs) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      return;
    }
    if (cssFullscreen) {
      setCssFullscreen(false);
      return;
    }

    const enterCssImmersive = () => setCssFullscreen(true);

    // iOS/iPadOS: shell requestFullscreen is a silent no-op. Use the video's
    // webkitEnterFullscreen (native controls) or CSS immersive reparented to body.
    if (isAppleTouchDevice()) {
      if (
        video &&
        video.webkitSupportsFullscreen !== false &&
        typeof video.webkitEnterFullscreen === "function"
      ) {
        const enterWebkit = () => {
          try {
            video.webkitEnterFullscreen?.();
          } catch {
            enterCssImmersive();
          }
        };
        // iOS often ignores webkitEnterFullscreen while the video is paused.
        if (video.paused) {
          void safePlay(video).then(enterWebkit).catch(() => enterCssImmersive());
          return;
        }
        enterWebkit();
        return;
      }
      enterCssImmersive();
      return;
    }

    // Android / desktop: fullscreen the player shell (keeps custom controls).
    const anyEl = el as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };

    const confirmNativeOrFallback = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const inFs =
            document.fullscreenElement ||
            (document as Document & { webkitFullscreenElement?: Element | null })
              .webkitFullscreenElement;
          if (!inFs) enterCssImmersive();
        });
      });
    };

    if (typeof el.requestFullscreen === "function") {
      void el.requestFullscreen().then(confirmNativeOrFallback).catch(enterCssImmersive);
      return;
    }
    if (typeof anyEl.webkitRequestFullscreen === "function") {
      try {
        anyEl.webkitRequestFullscreen();
        confirmNativeOrFallback();
        return;
      } catch {
        /* fall through to CSS immersive */
      }
    }
    enterCssImmersive();
  }, [cssFullscreen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") skip(REWIND_SECONDS);
      if (e.code === "ArrowLeft") skip(-REWIND_SECONDS);
      if (e.code === "KeyF") toggleFullscreen();
      if (e.code === "KeyM") toggleMute();
      if (e.code === "KeyP") void togglePip();
      if (e.code === "Escape" && cssFullscreen) setCssFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleFullscreen, toggleMute, togglePip, cssFullscreen, skip]);

  const qualityLabel =
    selectedLevel === -1
      ? autoLevel >= 0 && levels[autoLevel]
        ? `Auto · ${qualityHeightLabel(levels[autoLevel].height)}`
        : "Auto"
      : levels.find((l) => l.index === selectedLevel)?.height
        ? qualityHeightLabel(levels.find((l) => l.index === selectedLevel)!.height)
        : "Auto";

  return (
    <figure className={fill ? "absolute inset-0 m-0" : "relative m-0 w-full"}>
      <div
        ref={containerRef}
        className={
          cssFullscreen
            ? "fixed inset-0 z-9999 h-dvh w-screen max-w-[100vw] overflow-hidden bg-black aspect-auto rounded-none"
            : [
                "relative w-full overflow-hidden bg-black",
                fill ? "h-full w-full aspect-auto" : "aspect-video",
                "[:fullscreen]:aspect-auto [:fullscreen]:h-full [:fullscreen]:w-full",
                "[:-webkit-full-screen]:aspect-auto [:-webkit-full-screen]:h-full [:-webkit-full-screen]:w-full",
                bleed || fill ? "" : "rounded-md",
              ].join(" ")
        }
        onMouseMove={resetHideTimer}
        onPointerDown={resetHideTimer}
        onMouseLeave={() => {
          if (playing) setShowControls(false);
        }}
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          playsInline
          preload={preloadMode}
          aria-label={`Video player: ${title}`}
          controlsList="nodownload noremoteplayback"
          disableRemotePlayback
          onContextMenu={(e) => e.preventDefault()}
        />

        {buffering && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-white/60" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <AlertCircle size={36} className="text-danger" />
            <p className="text-[13px] font-medium text-white/80">{error}</p>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 transition-opacity duration-300"
          style={{
            opacity: showControls ? 1 : 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          }}
        />

        <div
          className={[
            "absolute inset-x-0 bottom-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-300",
            showControls ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
          style={{ opacity: showControls ? 1 : 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="group/seek relative mb-3 h-1 cursor-pointer rounded-full bg-white/20 hover:h-1.25"
            style={{ transition: "height 120ms ease" }}
            onClick={seek}
          >
            <div
              ref={bufferedBarRef}
              className="absolute inset-y-0 left-0 rounded-full bg-white/25"
              style={{ width: "0%" }}
            />
            <div
              ref={progressBarRef}
              className="absolute inset-y-0 left-0 rounded-full bg-brand"
              style={{ width: "0%" }}
            />
            <div
              ref={thumbRef}
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
              style={{ left: "calc(0% - 6px)" }}
            />
          </div>

          <div className="flex items-center gap-3">
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

            <button
              type="button"
              onClick={() => skip(-REWIND_SECONDS)}
              aria-label="Rewind 10 seconds"
              className="text-white transition-opacity hover:opacity-75"
            >
              <RotateCcw size={18} />
            </button>

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

            <span
              ref={timeDisplayRef}
              className="tabular-nums text-[11px] font-medium text-white/75"
            >
              {formatTime(displayTime)}{" "}
              <span className="text-white/40">/</span>{" "}
              {formatTime(duration)}
            </span>

            <div className="flex-1" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeed((v) => !v)}
                className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Playback speed"
              >
                <Gauge size={14} />
                <span>{playbackRate === 1 ? "1x" : `${playbackRate}x`}</span>
              </button>

              {showSpeed && (
                <div className="absolute bottom-full right-0 mb-2 min-w-24 overflow-hidden rounded-md border border-white/10 bg-[#141414] py-1">
                  <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                    Speed
                  </div>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => changeSpeed(rate)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      {playbackRate === rate && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      )}
                      <span className={playbackRate === rate ? "text-brand" : ""}>
                        {rate === 1 ? "Normal" : `${rate}x`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                          {qualityHeightLabel(levels[autoLevel].height)}
                        </span>
                      )}
                    </button>

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
                              ? qualityHeightLabel(l.height)
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

            {pipSupported && (
              <button
                type="button"
                onClick={() => void togglePip()}
                aria-label={pipActive ? "Exit picture-in-picture" : "Picture-in-picture"}
                title={pipActive ? "Exit picture-in-picture (p)" : "Picture-in-picture (p)"}
                className={[
                  "transition-colors",
                  pipActive ? "text-brand" : "text-white/75 hover:text-white",
                ].join(" ")}
              >
                <PictureInPicture2 size={16} />
              </button>
            )}

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

/** Inline skeleton shown while the hls.js chunk loads. */
export function WatchPlayerSkeleton({ fill = false }: { fill?: boolean } = {}) {
  return (
    <div
      className={[
        "flex w-full items-center justify-center bg-black",
        fill ? "absolute inset-0 h-full w-full" : "aspect-video",
      ].join(" ")}
    >
      <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
      <span className="sr-only">Loading player</span>
    </div>
  );
}
