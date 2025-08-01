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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical vendor libraries (loaded first)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Group other vendor libraries
            return 'vendor-misc';
          }
          
          // App components by feature (lazy loaded)
          if (id.includes('/components/')) {
            if (id.includes('Modal') || id.includes('AddHolding') || id.includes('EditTransaction')) {
              return 'chunk-modals';
            }
            if (id.includes('Tab') || id.includes('Performance') || id.includes('Accounts') || id.includes('Dividends') || id.includes('Tax')) {
              return 'chunk-tabs';
            }
            if (id.includes('mobile/')) {
              return 'chunk-mobile';
            }
            // Core components that load early
            if (id.includes('LoadingScreen') || id.includes('PortfolioTable') || id.includes('PortfolioSummary')) {
              return 'chunk-core-ui';
            }
            return 'chunk-components';
          }
          
          // Database and hooks (critical)
          if (id.includes('/lib/') || id.includes('/hooks/')) {
            return 'chunk-core';
          }
          
          // Utils and services (non-critical)
          if (id.includes('/utils/') || id.includes('/services/')) {
            return 'chunk-utils';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          // Priority loading for critical chunks
          if (name?.includes('vendor') || name?.includes('core')) {
            return 'assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/entry-[hash].js',
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
    chunkSizeWarningLimit: 800
  }
});
