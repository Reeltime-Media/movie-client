import { Play } from "lucide-react";

interface TrailerEmbedProps {
  embedUrl: string;
  title: string;
  /** bare = text above, card = box with icon, frame-only = literally just the video */
  variant?: "card" | "bare" | "frame-only";
}

export function TrailerEmbed({ embedUrl, title, variant = "bare" }: TrailerEmbedProps) {
  const player = (
    <div className={`relative aspect-video w-full overflow-hidden ${variant !== "frame-only" ? "bg-black ring-1 ring-white/10" : ""}`}>
      <iframe
        src={embedUrl}
        title={`${title} trailer`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );

  if (variant === "frame-only") {
    return player;
  }

  if (variant === "card") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-border bg-surface-elevated text-brand">
            <Play size={14} className="fill-brand" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Preview
            </p>
            <p className="text-[14px] font-semibold text-text">{title} trailer</p>
          </div>
        </div>
        {player}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        Trailer
      </p>
      {player}
    </div>
  );
}
