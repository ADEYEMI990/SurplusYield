import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
