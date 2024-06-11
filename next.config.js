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
    domains: ['realt.co']
  },
  publicRuntimeConfig: {
    version,
    THEGRAPH_API_KEY: process.env.NEXT_PUBLIC_THEGRAPH_API_KEY,
  },
};

module.exports = nextConfig;
