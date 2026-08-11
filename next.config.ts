import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a self-contained server bundle
  // (.next/standalone) with only the production deps it actually needs,
  // instead of shipping the whole node_modules tree into the image.
  output: "standalone",
};

export default nextConfig;
