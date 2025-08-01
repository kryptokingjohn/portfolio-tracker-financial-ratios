import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
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
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Portfolio Tracker Pro',
        short_name: 'Portfolio Pro',
        description: 'Professional portfolio tracking with comprehensive financial ratios and performance analytics',
        start_url: '/',
        display: 'standalone',
        background_color: '#1f2937',
        theme_color: '#3b82f6',
        orientation: 'portrait-primary',
        categories: ['finance', 'business', 'productivity'],
        lang: 'en-US',
        scope: '/',
        prefer_related_applications: false,
        icons: [
          {
            src: 'icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: 'icon-512x512.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Portfolio dashboard showing holdings and performance metrics'
          },
          {
            src: 'icon-512x512.png',
            sizes: '750x1334',
            type: 'image/png',
            label: 'Mobile portfolio view with transaction history'
          }
        ],
        shortcuts: [
          {
            name: 'Add Transaction',
            short_name: 'Add',
            description: 'Quickly add a new transaction',
            url: '/?action=add',
            icons: [{ src: 'icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'View Performance',
            short_name: 'Performance',
            description: 'Check portfolio performance',
            url: '/?tab=performance',
            icons: [{ src: 'icon-96x96.png', sizes: '96x96' }]
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5174
    }
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    minify: false, // Disable minification for better error debugging
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false
      }
    },
    assetsInlineLimit: 0, // Prevent inlining to avoid MIME issues
    rollupOptions: {
      output: {
        format: 'es', // Ensure ES modules format
        // Simplify chunking to avoid dependency issues
        manualChunks: (id) => {
          // Only essential vendor chunks to avoid circular dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Bundle everything else together to avoid dependency issues
            return 'vendor-misc';
          }
          // Don't split app code to avoid initialization issues
          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].mjs', // Use .mjs extension to force module recognition
        entryFileNames: 'assets/entry-[hash].mjs',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) {
            return 'assets/styles-[hash].css';
          }
          if (name.match(/\.(png|jpe?g|svg|gif|webp|avif)$/)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
