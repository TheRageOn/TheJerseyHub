import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local IP connections from mobile devices on your Wi-Fi network
  allowedDevOrigins: ["192.168.1.3"],

  // SVGs are served from /public — skip image optimization pipeline for them
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.getlayers.ai" },
    ],
    // Disable the built-in image optimizer for local SVGs (they're already vector)
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Strip X-Powered-By header
  poweredByHeader: false,

  // Strict React for dev-time double-render checks
  reactStrictMode: true,

  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Security & caching headers
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sound.mp3",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
