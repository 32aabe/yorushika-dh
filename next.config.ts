import type { NextConfig } from "next";

const repo = "yorushika-dh";
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  ...(isGithubActions
    ? {
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
      }
    : {}),
};

export default nextConfig;