import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    tailwindcss(),

    VitePWA({
      registerType: "prompt",
      injectRegister: false,

      includeAssets: [
        "icon48.png",
        "icon72.png",
        "icon96.png",
        "icon144.png",
        "icon192.png",
        "icon512.png",
      ],

      manifest: {
        name: "F1 | داشبورد فرمول یک",
        short_name: "F1 ایران",
        description: "داشبورد اطلاعات فرمول یک به زبان فارسی",
        start_url: "/",
        scope: "/",
        id: "/",
        display: "standalone",
        background_color: "#0B0B12",
        theme_color: "#0B0B12",
        dir: "rtl",
        lang: "fa",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icon48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openf1\.org\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "openf1-runtime",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
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
      "@": resolve(__dirname, "src"),
    },
  },

  build: {
    target: "es2020",
  },
});
