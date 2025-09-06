/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.module.exprContextCritical = false;
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Alias for handlebars to use the browser-compatible version
    config.resolve.alias['handlebars'] = 'handlebars/dist/handlebars.js';

    return config;
  },
};

module.exports = nextConfig;
