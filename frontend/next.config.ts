import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack due to issues with next/font/google in Next.js 16
  turbopack: false,
};

export default nextConfig;