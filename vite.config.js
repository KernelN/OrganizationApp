import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/OrganizationApp/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022'
  },
  server: {
    port: 3000,
    open: false
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Cronograma',
        short_name: 'Cronograma',
        description: 'Intelligent task scheduling',
        theme_color: '#6366F1',
        background_color: '#121318',
        display: 'standalone',
        start_url: '/OrganizationApp/',
        scope: '/OrganizationApp/',
        icons: [
          {
            src: '/OrganizationApp/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/OrganizationApp/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
