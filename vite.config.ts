import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // We call registerSW() ourselves in main.ts, so skip the auto-injected script.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icon.png'],
      manifest: {
        name: 'F1 ایران - داشبورد فرمول یک',
        short_name: 'F1 ایران',
        description: 'داشبورد اطلاعات فرمول یک به زبان فارسی، مبتنی بر OpenF1 API',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#0B0B12',
        theme_color: '#0B0B12',
        dir: 'rtl',
        lang: 'fa',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Matches the app's existing OpenF1 rate-limit/caching approach
        // (see src/services/cache.ts) at the network layer.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openf1\.org\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'openf1-runtime',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-chart': ['apexcharts', 'vue3-apexcharts'],
          'vendor-http': ['axios'],
          'vendor-i18n': ['vue-i18n'],
        },
      },
    },
  },
})