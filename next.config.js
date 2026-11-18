/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  images: {
    domains: ['images.unsplash.com', 'storage.googleapis.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
