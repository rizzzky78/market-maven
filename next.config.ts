import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Self-contained server bundle (.next/standalone) shipped by the Docker `web` image. */
  output: "standalone",
  /** Build worker count, capped by `deploy.sh` (NEXT_BUILD_CPUS) to fit the build's resource budget. */
  ...(Number(process.env.NEXT_BUILD_CPUS) > 0 && {
    experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) },
  }),
  /** AI settings moved into the chat shell; keep the old URL working. */
  async redirects() {
    return [
      {
        source: "/settings/:path*",
        destination: "/chat/settings/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.tokopedia.net",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "service.firecrawl.dev",
      },
      {
        hostname: "images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "ac1wy0nbjb.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
