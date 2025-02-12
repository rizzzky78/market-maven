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
      {
        hostname: "images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com",
      },
    ],
  },
};

export default nextConfig;
