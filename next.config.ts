import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {

    unoptimized: true,
  },
  output: "export",
  distDir: "dist",
  /* config options here */
};

export default nextConfig;
