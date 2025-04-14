import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['https://9000-idx-studio-1744477285432.cluster-ve345ymguzcd6qqzuko2qbxtfe.cloudworkstations.dev'],
};

export default nextConfig;
