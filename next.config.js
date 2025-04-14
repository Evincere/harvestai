/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.openweathermap.org', 'openweathermap.org'],
  },
  // Configuración para entorno de desarrollo
  webpack: (config, { dev, isServer }) => {
    // Solo en desarrollo y en el servidor
    if (dev && isServer) {
      // Agregar variables de entorno para el servidor
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.log('⚠️ Verificación SSL deshabilitada en desarrollo. NO usar en producción.');
    }
    return config;
  },
};

module.exports = nextConfig;
