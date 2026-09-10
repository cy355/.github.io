import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: '学习工作台',
        short_name: '学习工作台',
        description: '个人学习工作台：刷题、错题本、间隔重复复习、掌握度热力图',
        lang: 'zh-CN',
        theme_color: '#E8B4B8',
        background_color: '#FDFBF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // tesseract.js 语言包运行时缓存
            urlPattern: /^https:\/\/.*\.(traineddata\.gz|js|mjs)$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'ocr-runtime', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  build: { chunkSizeWarningLimit: 1600 }
});
