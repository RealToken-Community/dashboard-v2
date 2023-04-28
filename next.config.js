/** @typedef { import('next').NextConfig } NextConfig */

/** @type { NextConfig } */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  images: {
    domains: ['realt.co']
  }
};

module.exports = nextConfig;
