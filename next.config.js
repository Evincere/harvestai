/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuracion minima
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
