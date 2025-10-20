import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],

  // ✅ Keep default build output directory
  build: {
    outDir: 'dist', // Vite default (safe for Render)
  },

  server: {
    proxy: {
      "/api": {
        target: "https://surplusyield.onrender.com", // your backend server
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "https://surplusyield.onrender.com", // serve uploaded images from backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
