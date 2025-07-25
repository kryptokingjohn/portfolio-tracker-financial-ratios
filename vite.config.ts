import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA disabled for StackBlitz compatibility
  ],
  optimizeDeps: {
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
