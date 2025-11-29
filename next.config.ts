import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Temporarily disabled if causing issues, or keep if stable
  typedRoutes: false,
  typescript: {
    ignoreBuildErrors: true
  },
  turbopack: {
    root: __dirname
  },

  // Performance Optimizations
  compress: true, // Enable Gzip compression

  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default withNextIntl(nextConfig);
