"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { isR2ImageUrl } from "@/lib/api/core/config";

type CdnImageProps = ImageProps & {
  /** Used when the primary src 404s (e.g. missing -w400 thumb). */
  fallbackSrc?: string | null;
};

/**
 * next/image wrapper that skips server optimization for R2 CDN URLs.
 * Posters on R2 are full-resolution uploads (often several MB); running them
 * through /_next/image hits the 7s fetch timeout in dev and adds latency in prod.
 *
 * When a `-w400` thumb is missing (older uploads), falls back to the full poster URL.
 */
export function CdnImage({ unoptimized, src, alt, fallbackSrc, onError, ...props }: CdnImageProps) {
  const initial = typeof src === "string" ? src : "";
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [failedThumb, setFailedThumb] = useState(false);

  useEffect(() => {
    setCurrentSrc(initial);
    setFailedThumb(false);
  }, [initial]);

  const resolvedFallback =
    fallbackSrc ||
    (initial.includes("-w400.") || initial.includes("-w220.")
      ? initial.replace(/-w\d+(\.[^.?#]+)/, "$1")
      : undefined);

  const activeSrc = currentSrc || src;
  const skipOptimization =
    unoptimized ?? (typeof activeSrc === "string" && isR2ImageUrl(activeSrc));

  return (
    <Image
      {...props}
      alt={alt}
      src={activeSrc}
      unoptimized={skipOptimization}
      onError={(e) => {
        if (!failedThumb && resolvedFallback && currentSrc !== resolvedFallback) {
          setFailedThumb(true);
          setCurrentSrc(resolvedFallback);
          return;
        }
        onError?.(e);
      }}
    />
  );
}
