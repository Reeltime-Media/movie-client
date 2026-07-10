import Image, { type ImageProps } from "next/image";
import { isR2ImageUrl } from "@/lib/api/config";

/**
 * next/image wrapper that skips server optimization for R2 CDN URLs.
 * Posters on R2 are full-resolution uploads (often several MB); running them
 * through /_next/image hits the 7s fetch timeout in dev and adds latency in prod.
 */
export function CdnImage({ unoptimized, src, ...props }: ImageProps) {
  const skipOptimization =
    unoptimized ?? (typeof src === "string" && isR2ImageUrl(src));
  return <Image {...props} src={src} unoptimized={skipOptimization} />;
}
