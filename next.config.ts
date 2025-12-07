import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7061',
        pathname: '/api/File/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/File/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['antd', 'lucide-react'],
  },
};

export default nextConfig;
