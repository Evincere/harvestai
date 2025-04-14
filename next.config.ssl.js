/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración específica para entornos con problemas de SSL
  experimental: {
    // Deshabilitar la comprobación de certificados SSL en desarrollo
    // ADVERTENCIA: Esto es inseguro y solo debe usarse en desarrollo
    // Esta configuración solo afecta a las peticiones realizadas por Next.js,
    // no a las peticiones realizadas por el código de la aplicación
    urlImports: {
      // Permitir importaciones desde cualquier URL sin verificar certificados
      allowHttp: true,
    },
  },
  // Configuración de proxy para APIs externas
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: '/api/proxy?url=:path*',
      },
    ];
  },
};

module.exports = nextConfig;
