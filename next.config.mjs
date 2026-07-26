/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // L'hébergement mutualisé limite le nombre de processus par compte ;
    // le nombre de CPU par défaut fait planter le build (SIGABRT).
    cpus: 1,
  },
};

export default nextConfig;
