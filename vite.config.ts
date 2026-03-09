import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy referral API requests to bypass CORS in development
      '/referral-api': {
        target: 'https://ref-api.ploutoslabs.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/referral-api/, '/api/v1'),
        secure: true,
      },
    },
  },
})
