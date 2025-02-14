/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`
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