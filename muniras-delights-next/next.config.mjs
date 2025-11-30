/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    domains: [],
    unoptimized: true, // Fixes many deploy issues
  },
  swcMinify: true,
};

export default nextConfig;
