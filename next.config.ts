import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/inverse-square' : '',
  assetPrefix: isGitHubPages ? '/inverse-square/' : '',
  trailingSlash: true,
};

export default nextConfig;
