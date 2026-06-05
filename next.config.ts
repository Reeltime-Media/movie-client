import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [{ source: "/api-proxy/:path*", destination: `${apiProxyTarget}/:path*` }];
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
