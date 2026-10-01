"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isR2ImageUrl } from "@/lib/api/core/config";

type CdnImageProps = ImageProps & {
  /** Used when the primary src 404s (e.g. a missing -w400 thumb). */
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
    (/-w\d+\.[^.?#]+/.test(src) ? src.replace(/-w\d+(\.[^.?#]+)/, "$1") : undefined);

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
 * When any `-w{width}` thumb is missing, falls back to the full poster URL.
 * Only -w400 thumbs are generated on upload (optimize_r2_image), so request 400.
 */
export function CdnImage({ src, alt, ...props }: CdnImageProps) {
  if (typeof src !== "string" || !src) {
    return <Image {...props} alt={alt} src={src} />;
  }
  return <CdnImageInner key={src} {...props} alt={alt} src={src} />;
}
