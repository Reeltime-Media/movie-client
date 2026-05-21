interface TrailerEmbedProps {
  embedUrl: string;
  title: string;
}

export function TrailerEmbed({ embedUrl, title }: TrailerEmbedProps) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-text-muted">
        Trailer
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
        <iframe
          src={embedUrl}
          title={`${title} trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
