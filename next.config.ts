import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only route badge. Build and runtime errors still show.
  devIndicators: false,
};

export default nextConfig;
