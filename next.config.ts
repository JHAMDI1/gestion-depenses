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
  }
};

export default withNextIntl(nextConfig);
