/* eslint-disable @typescript-eslint/no-var-requires */

const { version } = require('./package.json')

/** @typedef { import('next').NextConfig } NextConfig */

/** @type { NextConfig } */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'realt.co',
      },
      {
        protocol: 'https',
        hostname: 'static.debank.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
}

module.exports = nextConfig
