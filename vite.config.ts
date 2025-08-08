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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mjs}'], // Include .mjs files
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB limit for mobile
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
              networkTimeoutSeconds: 3, // Fast timeout for mobile
              expiration: {
                maxEntries: 100, // More entries for mobile
                maxAgeSeconds: 60 * 5 // 5 minutes for portfolio data
              }
            }
          },
          // Cache API responses for portfolio data
          {
            urlPattern: /\/api\/portfolio\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'portfolio-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 10 // 10 minutes
              }
            }
          },
          // Cache static images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
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
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    assetsInlineLimit: 4096, // Inline small assets for mobile to reduce requests
    rollupOptions: {
      output: {
        format: 'es',
        // Mobile-optimized chunking strategy
        manualChunks: (id) => {
          // Critical vendor libraries - load first and keep small
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'; // ~157KB - Critical for mobile first load
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase'; // ~117KB - Database operations
            }
            if (id.includes('@stripe')) {
              return 'vendor-stripe'; // ~1.5KB - Payment processing (lazy loaded)
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'; // Icons - keep separate for caching
            }
            return 'vendor-misc'; // ~6KB - Small misc vendors
          }
          
          // Mobile app code splitting
          if (id.includes('/components/mobile/')) {
            return 'chunk-mobile'; // Mobile-specific components together
          }
          
          // App code splitting by feature
          if (id.includes('/components/')) {
            // Heavy modal components - lazy loaded for mobile
            if (id.includes('Modal') || id.includes('Checkout')) {
              return 'chunk-modals'; // ~65KB - Lazy loaded
            }
            // Tab components - lazy loaded on mobile
            if (id.includes('Tab') || id.includes('Performance') || id.includes('Accounts')) {
              return 'chunk-tabs'; // ~140KB - Lazy loaded on mobile
            }
            // Charts and visualization - lazy loaded
            if (id.includes('Chart') || id.includes('Guide')) {
              return 'chunk-charts'; // ~76KB - Lazy loaded
            }
            // Core UI components - load with main app
            if (id.includes('Portfolio') || id.includes('Loading') || id.includes('Summary')) {
              return 'chunk-core-ui'; // ~11KB - Critical UI
            }
          }
          
          // Utilities and services
          if (id.includes('/services/') || id.includes('/utils/')) {
            return 'chunk-utils'; // ~60KB - Utilities and services
          }
          
          return undefined; // Default chunk
        },
        chunkFileNames: 'assets/[name]-[hash].mjs',
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
    chunkSizeWarningLimit: 500 // Lower limit for mobile optimization
  }
});
