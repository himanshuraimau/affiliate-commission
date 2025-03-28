/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: true,
    serverExternalPackages: ['mongoose']
  }
}

module.exports = nextConfig
