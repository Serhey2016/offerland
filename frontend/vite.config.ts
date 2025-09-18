import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    fastRefresh: false
  })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    hmr: false,
    https: false, // Keep HTTP for now, but add proper CORS headers
    fs: {
      allow: ['..']
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'calendar.js',
        chunkFileNames: 'calendar-[hash].js',
        assetFileNames: 'calendar-[hash].[ext]'
      }
    }
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['primereact'],
    exclude: ['chart.js/auto', 'quill']
  },
  resolve: {
    alias: {
      'chart.js/auto': 'chart.js',
      'quill': 'quill',
      '/static': '../static'
    }
  },
  publicDir: '../static',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf']
})


