import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'calendar.js',
        chunkFileNames: 'calendar-[hash].js',
        assetFileNames: 'calendar-[hash].[ext]'
      }
    }
  }
})


