import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    fastRefresh: false,
    include: "**/*.{jsx,tsx}",
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: false, // Отключаем HMR полностью
    https: false,
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRFToken'
    },
    fs: {
      allow: ['..']
    },
    cors: {
      origin: ['http://localhost:8000', 'http://192.168.0.146:8000', 'http://192.168.0.146:5173'],
      credentials: true
    },
    sourcemapIgnoreList: false,
    proxy: {
      '/task-tracker/api': {
        target: 'http://192.168.0.146:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://192.168.0.146:8000',
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
    include: ['primereact', 'primereact/button', 'primereact/menu'],
    exclude: ['chart.js/auto', 'quill', 'primeicons'],
    force: true
  },
  resolve: {
    alias: {
      'chart.js/auto': 'chart.js',
      'quill': 'quill',
      '/static': '../static',
      // ✅ Алиас для PrimeIcons шрифтов
      'primeicons/fonts': '/fonts'
    }
  },
  publicDir: '../static',
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot', '**/*.svg'],
  assetsInlineLimit: 0 // Don't inline font files
})