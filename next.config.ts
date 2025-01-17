import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
