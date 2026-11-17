import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a fully static site in `out/` (used for GitHub Pages).
 * NEXT_PUBLIC_BASE_PATH sets the sub-path when hosted at /<repo>.
 */
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath,
  ...(isExport ? { output: "export", trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
