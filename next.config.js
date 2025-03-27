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
  
  // Use the correct property name for external packages
  experimental: {
    serverExternalPackages: ['mongoose']
  }
};

module.exports = nextConfig;
