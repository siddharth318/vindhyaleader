import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
      },
    ],
  },
  // Image uploads go through Server Actions (which default to a 1MB body cap).
  // Raise it so the 8MB file limit enforced in the media upload actions can
  // actually be reached — the extra 1MB is headroom for multipart/form-data
  // overhead (boundaries + part headers) that rides along with the file.
  experimental: {
    serverActions: {
      bodySizeLimit: "9mb",
    },
  },
};

export default nextConfig;
