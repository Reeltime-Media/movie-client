import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auto-memoize components/hooks; the codebase passes the compiler's lint rules.
  reactCompiler: true,
  experimental: {
    // R2 posters are large originals; allow more time when optimization is used.
    imgOptTimeoutInSeconds: 30,
  },
  images: {
    // Serve modern, smaller formats; the browser picks the best it supports.
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 88],
    remotePatterns: [
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
