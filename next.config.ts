import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Self-contained server bundle (.next/standalone) shipped by the Docker `web` image. */
  output: "standalone",
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
