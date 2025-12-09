import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize compilation
    optimizePackageImports: ['@prisma/client'],
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    // Turbopack-specific config if needed
  },
};

export default nextConfig;