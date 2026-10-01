/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
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
  // Ensure heavy server-only packages are not bundled for client
  serverExternalPackages: ['mongoose', 'bcryptjs', 'razorpay', 'nodemailer', 'resend', 'sharp'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'gsap',
      'lenis',
      'react-toastify',
      'axios',
      'jspdf',
      'html2canvas'
    ],
  },
};

export default nextConfig;
