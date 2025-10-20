import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to copy _redirects file into dist/
function copyRedirects() {
  return {
    name: 'copy-redirects',
    closeBundle() {
      const src = resolve(__dirname, 'public/_redirects')
      const dest = resolve(__dirname, 'dist/_redirects')

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
        console.log('✅ Copied _redirects to dist/')
      } else {
        console.warn('⚠️  No _redirects file found in public/')
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyRedirects()],

  build: {
    outDir: 'dist', // Vite default
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://surplusyield.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://surplusyield.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})