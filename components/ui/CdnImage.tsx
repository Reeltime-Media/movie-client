"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isR2ImageUrl } from "@/lib/api/core/config";

type CdnImageProps = ImageProps & {
  /** Used when the primary src 404s (e.g. missing -w400 thumb). */
  fallbackSrc?: string | null;
};

function CdnImageInner({
  unoptimized,
  src,
  alt,
  fallbackSrc,
  onError,
  ...props
}: CdnImageProps & { src: string }) {
  const [useFallback, setUseFallback] = useState(false);

  const resolvedFallback =
    fallbackSrc ||
    (src.includes("-w400.") || src.includes("-w220.")
      ? src.replace(/-w\d+(\.[^.?#]+)/, "$1")
      : undefined);

  const activeSrc = useFallback && resolvedFallback ? resolvedFallback : src;
  const skipOptimization = unoptimized ?? isR2ImageUrl(activeSrc);

  return (
    <Image
      {...props}
      alt={alt}
      src={activeSrc}
      unoptimized={skipOptimization}
      onError={(e) => {
        if (!useFallback && resolvedFallback && activeSrc !== resolvedFallback) {
          setUseFallback(true);
          return;
        }
        onError?.(e);
      }}
    />
  );
}

/**
 * next/image wrapper that skips server optimization for R2 CDN URLs.
 * Posters on R2 are full-resolution uploads (often several MB); running them
 * through /_next/image hits the 7s fetch timeout in dev and adds latency in prod.
 *
 * When a `-w400` thumb is missing (older uploads), falls back to the full poster URL.
 */
export function CdnImage({ src, alt, ...props }: CdnImageProps) {
  if (typeof src !== "string" || !src) {
    return <Image {...props} alt={alt} src={src} />;
  }
  return <CdnImageInner key={src} {...props} alt={alt} src={src} />;
}
