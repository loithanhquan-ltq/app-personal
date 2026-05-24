import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/app-personal",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
