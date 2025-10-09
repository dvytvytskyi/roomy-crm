/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Enable static file serving for Bryntum assets
  async rewrites() {
    return [
      {
        source: '/build/:path*',
        destination: '/build/:path*',
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
