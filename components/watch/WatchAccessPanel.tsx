import { CdnImage } from "@/components/ui/CdnImage";
import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { posterUrl } from "@/lib/api/client";

type WatchAccessPanelProps = {
  title: string;
  posterKey?: string | null;
  message: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  bleed?: boolean;
};

export function WatchAccessPanel({
  title,
  posterKey,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  bleed = false,
}: WatchAccessPanelProps) {
  const imageSrc = posterUrl(posterKey);

  return (
    <div
      className={[
        "relative aspect-video w-full overflow-hidden bg-black",
        bleed ? "border-y border-border" : "",
      ].join(" ")}
    >
      {imageSrc ? (
        <CdnImage
          src={imageSrc}
          alt={`${title} poster`}
          fill
          className="object-cover object-[center_15%] opacity-40"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-elevated" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10">
          <Lock size={22} className="text-white" aria-hidden />
        </div>
        <p className="max-w-md text-[14px] font-medium leading-relaxed text-white/90">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center rounded-md border border-white/25 bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
