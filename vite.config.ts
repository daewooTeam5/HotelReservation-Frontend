import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'images/logo.png'],
      manifest: {
        name: 'Hotel Reservation',
        short_name: 'Hotel Reservation',
        description: '호텔 예약 서비스',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          // Windows 11 icons
          { src: '/images/icon/windows11/SmallTile.scale-100.png', sizes: '71x71', type: 'image/png' },
          { src: '/images/icon/windows11/SmallTile.scale-125.png', sizes: '89x89', type: 'image/png' },
          { src: '/images/icon/windows11/SmallTile.scale-150.png', sizes: '107x107', type: 'image/png' },
          { src: '/images/icon/windows11/SmallTile.scale-200.png', sizes: '142x142', type: 'image/png' },
          { src: '/images/icon/windows11/SmallTile.scale-400.png', sizes: '284x284', type: 'image/png' },
          { src: '/images/icon/windows11/Square150x150Logo.scale-100.png', sizes: '150x150', type: 'image/png' },
          { src: '/images/icon/windows11/Square150x150Logo.scale-125.png', sizes: '188x188', type: 'image/png' },
          { src: '/images/icon/windows11/Square150x150Logo.scale-150.png', sizes: '225x225', type: 'image/png' },
          { src: '/images/icon/windows11/Square150x150Logo.scale-200.png', sizes: '300x300', type: 'image/png' },
          { src: '/images/icon/windows11/Square150x150Logo.scale-400.png', sizes: '600x600', type: 'image/png' },
          { src: '/images/icon/windows11/Wide310x150Logo.scale-100.png', sizes: '310x150', type: 'image/png' },
          { src: '/images/icon/windows11/Wide310x150Logo.scale-125.png', sizes: '388x188', type: 'image/png' },
          { src: '/images/icon/windows11/Wide310x150Logo.scale-150.png', sizes: '465x225', type: 'image/png' },
          { src: '/images/icon/windows11/Wide310x150Logo.scale-200.png', sizes: '620x300', type: 'image/png' },
          { src: '/images/icon/windows11/Wide310x150Logo.scale-400.png', sizes: '1240x600', type: 'image/png' },
          { src: '/images/icon/windows11/LargeTile.scale-100.png', sizes: '310x310', type: 'image/png' },
          { src: '/images/icon/windows11/LargeTile.scale-125.png', sizes: '388x388', type: 'image/png' },
          { src: '/images/icon/windows11/LargeTile.scale-150.png', sizes: '465x465', type: 'image/png' },
          { src: '/images/icon/windows11/LargeTile.scale-200.png', sizes: '620x620', type: 'image/png' },
          { src: '/images/icon/windows11/LargeTile.scale-400.png', sizes: '1240x1240', type: 'image/png' },
          // Android icons
          { src: '/images/icon/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/images/icon/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/icon/android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/images/icon/android/android-launchericon-96-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/images/icon/android/android-launchericon-72-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/images/icon/android/android-launchericon-48-48.png', sizes: '48x48', type: 'image/png' },
          // iOS icons (대표 사이즈만)
          { src: '/images/icon/ios/180.png', sizes: '180x180', type: 'image/png' },
          { src: '/images/icon/ios/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/images/icon/ios/256.png', sizes: '256x256', type: 'image/png' },
          { src: '/images/icon/ios/512.png', sizes: '512x512', type: 'image/png' },
          { src: '/images/icon/ios/1024.png', sizes: '1024x1024', type: 'image/png' }
        ],
        screenshots: [
          {
            // 모바일용 (세로) 스크린샷
            "src": "/images/icon/ios/1024.png",
            "sizes": "1024x1024",
            "type": "image/png"
          },
          {
            // 데스크톱용 (가로) 스크린샷
            "src": "/images/icon/ios/1024.png",
            "sizes": "1024x1024",
            "type": "image/png",
            "form_factor": "wide" // "이건 넓은 화면용이야!" 라는 표시!
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: ({ url }) => {
              const serverUrl = 'https://hotelly.store';
              return url.origin === serverUrl;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
