import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le back-end n'a pas de configuration CORS.
// Le proxy de développement transmet /api -> http://localhost:8080.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})