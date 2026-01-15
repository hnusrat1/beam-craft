import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/beam-craft' : '',
  assetPrefix: isGitHubPages ? '/beam-craft/' : '',
  trailingSlash: true,
};

export default nextConfig;
