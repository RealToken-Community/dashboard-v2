/* eslint-disable @typescript-eslint/no-var-requires */

const { version } = require('./package.json')

/** @typedef { import('next').NextConfig } NextConfig */

/** @type { NextConfig } */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  images: {
    domains: ['realt.co', 'static.debank.com'],
  },
  publicRuntimeConfig: {
    version,
  },
}

module.exports = nextConfig
