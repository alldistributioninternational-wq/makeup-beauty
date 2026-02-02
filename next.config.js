/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver le cache agressif pendant le développement
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configuration des images
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Générer un ID unique à chaque build pour forcer le refresh
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // Headers pour désactiver le cache navigateur en dev
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig