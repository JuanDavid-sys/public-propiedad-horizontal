import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Configuración para Netlify - NO usar output: 'export'
  // El plugin @netlify/plugin-nextjs maneja el deploy
  images: {
    unoptimized: true,
  },
  // Variables de entorno para la build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    // Solo aplica en desarrollo (Docker)
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/media/:path*',
          destination: 'http://backend:8000/media/:path*',
        },
      ];
    }
    return [];
  },
  // Headers para evitar cache problemático
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
