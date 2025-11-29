// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,
  
  // Ensure proper trailing slashes
  trailingSlash: false,
  
  // Image optimization configuration
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig