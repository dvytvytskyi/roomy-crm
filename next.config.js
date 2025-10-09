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

    // Fix for CommonJS/ESM compatibility issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'mime-db': require.resolve('mime-db'),
    };

    // Disable problematic optimizations and fix vendor chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: false, // Disable splitChunks to avoid vendor issues
    };

    // Fix for server-side rendering issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'mime-db': 'commonjs mime-db',
      });
    }
    
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
