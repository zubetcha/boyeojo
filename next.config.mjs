/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mail.google.com',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: false
};

export default nextConfig;
