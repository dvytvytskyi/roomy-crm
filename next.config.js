/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle Bryntum modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
  // Enable static file serving for Bryntum assets
  async rewrites() {
    return [
      {
        source: '/build/:path*',
        destination: '/build/:path*',
      },
    ];
  },
}

module.exports = nextConfig
