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
    https: false,
    fs: {
      allow: ['..']
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    sourcemapIgnoreList: false,
    proxy: {
      '/task-tracker/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: 'inline',
    rollupOptions: {
      output: {
        entryFileNames: 'calendar.js',
        chunkFileNames: 'calendar-[hash].js',
        assetFileNames: 'calendar-[hash].[ext]',
        sourcemap: true
      }
    }
  },
  css: {
    devSourcemap: true
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false
  },
  optimizeDeps: {
    include: ['primereact'],
    exclude: ['chart.js/auto', 'quill'],
    force: true
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


