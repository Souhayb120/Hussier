import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Le back-end n'a pas de configuration CORS.
// Le proxy de développement transmet /api -> back-end Mofawid.
// L'URL cible est lue dans MOFAWID_API (.env), avec repli sur Render.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.MOFAWID_API || 'https://mofawid-backend.onrender.com'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
