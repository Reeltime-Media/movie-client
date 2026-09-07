import type { NextConfig } from "next";
import { cspConnectSrc } from "./lib/csp-connect-src";

function securityHeaders(): { key: string; value: string }[] {
  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src ${cspConnectSrc()}`,
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
        "media-src 'self' https: blob:",
      ].join("; "),
    },
  ];
}

const nextConfig: NextConfig = {
  // Auto-memoize components/hooks; the codebase passes the compiler's lint rules.
  reactCompiler: true,
  experimental: {
    // R2 posters are large originals; allow more time when optimization is used.
    imgOptTimeoutInSeconds: 30,
  },
  async headers() {
    // In dev, Turbopack can reuse chunk URLs while content changes — never
    // mark those as immutable or the browser keeps serving broken modules.
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/_next/static/:path*",
          headers: [{ key: "Cache-Control", value: "no-store" }],
        },
      ];
    }
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
      {
        // Build-hashed — safe to cache forever.
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // /public media (logo, sample images/video, payment badge) — filenames
        // aren't hashed, so keep a shorter cache with revalidation.
        source: "/:path*.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|mp4|webm)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
  images: {
    // Serve modern, smaller formats; the browser picks the best it supports.
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 88],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.reeltime.fun",
      },
      {
        protocol: "https",
        hostname: "pub-54c6a20fcd354e4d885b4ce83457064a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-25935d9298c34f1486e55539f8d5bec4.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
