import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions are used throughout for mutations (member CRUD, payments,
  // progress logging); keep the body size limit generous enough for future
  // profile-photo uploads without opening it up unnecessarily.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Add remote patterns here if member/profile photos move to a CDN later.
    formats: ["image/webp"],
  },
};

export default nextConfig;
