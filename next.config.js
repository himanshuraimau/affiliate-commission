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
  
  // Remove the deprecated experimental option
  experimental: {
    // serverExternalPackages has been removed in Next.js 15
    // using webpack externals configuration instead (above)
  }
};

module.exports = nextConfig;
