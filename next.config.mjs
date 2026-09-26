/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Ensure server-only packages are not bundled for client
  serverExternalPackages: ['mongoose', 'bcryptjs', 'razorpay'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap', 'lenis', 'react-toastify', 'axios'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
