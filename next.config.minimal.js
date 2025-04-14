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
  // Deshabilitar características innecesarias
  poweredByHeader: false,
  compress: false,
  // Deshabilitar análisis de imágenes
  images: {
    disableStaticImages: true,
  },
  // Deshabilitar optimizaciones
  optimizeFonts: false,
  // Deshabilitar compilación incremental
  experimental: {
    incrementalCacheHandlerPath: false,
  },
};

module.exports = nextConfig;
