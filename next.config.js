/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '/avatar/**',
      },
    ],
  },
  webpack: (config) => {
    return config
  },
  experimental: {
    allowDynamicServerAttributes: true
  }
}

module.exports = nextConfig 