/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: '**.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'myscore24.com',
          },
        ],
        destination: 'https://www.myscore24.com/:path*',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/competition/:slug*',
        destination: '/league/:slug*',
      },
    ]
  },
}

export default nextConfig
