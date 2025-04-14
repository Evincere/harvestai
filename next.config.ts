/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración condicional según el entorno
  async rewrites() {
    // Solo configurar proxy en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: '/api/proxy?url=:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;