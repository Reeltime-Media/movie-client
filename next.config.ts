import type { NextConfig } from "next";

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
        hostname: "pub-54c6a20fcd354e4d885b4ce83457064a.r2.dev",
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
