/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Bryntum modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Fix for mime-db vendor chunk issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'mime-db': require.resolve('mime-db'),
    };

    // Disable problematic optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Keep vendor chunks but don't split mime-db
          vendor: {
            test: /[\\/]node_modules[\\/](?!mime-db)/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
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
