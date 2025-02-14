/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  // Enable SWC minification except in Docker development
  swcMinify: process.env.DOCKER_ENV !== 'development',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      }
    ];
  },
  // Configure webpack for Docker development
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev && process.env.DOCKER_ENV === 'development') {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      }
    }
    return config
  },
};

module.exports = nextConfig; 