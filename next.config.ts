import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep dev and production builds isolated so local runtime does not corrupt QA/build artifacts.
  distDir: process.env.ROUTEPULSE_DIST_DIR || ".next-app",
};

export default nextConfig;
