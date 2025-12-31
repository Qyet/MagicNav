/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'favicon.im',
      },
    ],
    minimumCacheTTL: 0,
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 配置所有页面为动态渲染，避免构建时执行数据库查询
  staticPageGenerationTimeout: 120,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
