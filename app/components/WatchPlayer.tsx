"use client";

export function WatchPlayer({
  sources,
  title,
  attribution,
}: {
  sources: readonly { src: string; type?: string }[];
  title: string;
  attribution: string;
}) {
  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full min-h-48 overflow-hidden rounded-[6px] border border-border bg-black sm:min-h-0">
        <video
          className="absolute inset-0 h-full w-full object-contain outline-none"
          controls
          playsInline
          preload="auto"
          aria-label={`Video player: ${title}`}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type ?? "video/mp4"} />
          ))}
          Your browser does not support embedded video.
        </video>
      </div>
      <figcaption className="sr-only">{attribution}</figcaption>
    </figure>
  );
}
