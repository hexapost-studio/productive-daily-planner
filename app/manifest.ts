import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Productive Daily Planner',
    short_name: 'PDP',
    description: 'Planificateur quotidien de productivité',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f11',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['productivity', 'utilities'],
  }
}
