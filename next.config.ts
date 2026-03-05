import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT_EXPORT === 'true' ? 'export' : undefined,
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
