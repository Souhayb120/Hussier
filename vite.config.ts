import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En développement, le proxy Vite redirige /api vers le backend Mofawid.
// La cible est lue dans MOFAWID_API (.env) — aucun URL durci dans le code.
// En production (npm run build), ce fichier ne sert pas : le navigateur appelle
// directement VITE_API_URL défini dans .env.production.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.MOFAWID_API || 'http://localhost:8080'

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
