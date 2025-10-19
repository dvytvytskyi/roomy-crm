/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    // Handle Bryntum modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Fix for CommonJS/ESM compatibility issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'mime-db': require.resolve('mime-db'),
    };
    
    return config;
  },
  // Enable static file serving for Bryntum assets and API proxy
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3002';
    return [
      {
        source: '/build/:path*',
        destination: '/build/:path*',
      },
      // Proxy API requests to backend
      {
        source: '/api/v2/:path*',
        destination: `${backendUrl}/api/v2/:path*`,
      },
    ];
  },
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'roomy-ae.s3.eu-west-3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
