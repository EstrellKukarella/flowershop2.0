import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh optimization
      fastRefresh: true,
      // Remove dev warnings in production
      babel: {
        compact: true
      }
    }),
    
    // PWA for caching and offline support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'kaspi-qr.png'],
      manifest: {
        name: 'Fashion Store',
        short_name: 'Fashion',
        description: 'Online Fashion Store',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache images
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            // Cache API responses
            urlPattern: /^https:\/\/.*\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Supabase images
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  
  build: {
    // Target modern browsers
    target: 'es2015',
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    
    // CSS minification
    cssMinify: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'telegram': ['@twa-dev/sdk'],
          'utils': [
            './src/utils/api.js',
            './src/utils/formatters.js',
            './src/utils/imageOptimizer.js'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@twa-dev/sdk'
    ],
    exclude: []
  },
  
  // Server config for development
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    // Enable CORS for development
    cors: true
  },
  
  // Preview server config
  preview: {
    port: 4173,
    strictPort: false
  }
});
