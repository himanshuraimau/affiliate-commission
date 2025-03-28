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
  
  // Updated for Next.js 15.1.0 compatibility
  experimental: {
    // Empty experimental section - serverExternalPackages removed
  }
};
module.exports = nextConfig;
