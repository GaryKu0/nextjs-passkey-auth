/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("bufferutil", "utf-8-validate", "ws");
    }
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/, message: /Critical dependency: the request of a dependency is an expression/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
