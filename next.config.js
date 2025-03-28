/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent server-side native module errors
      config.externals.push('mongoose');
    }
    // Simpler fallbacks
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // Add the settings from next.config.mjs
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true,
    ignoreBuildErrors: true
  },
  
  // For Next.js 15.1.0 compatibility
  experimental: {
    // Empty experimental section
    serverComponentsExternalPackages: [],
  }
};

module.exports = nextConfig;
