/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development', // ← en dev no optimiza, evita el bloqueo
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/v1/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig