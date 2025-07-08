import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  // Debug: Verificar carga de variables de entorno en Vite
  console.log('🔧 [Vite Config] Modo:', mode)
  console.log('🔧 [Vite Config] Variables VITE_ encontradas:', 
    Object.keys(env).filter(key => key.startsWith('VITE_')).length
  )
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true
    },
    // Asegurar que las variables de entorno estén disponibles
    define: {
      // Exponer variables de entorno específicas si es necesario
      __VITE_FIREBASE_API_KEY__: JSON.stringify(env.VITE_FIREBASE_API_KEY),
      __VITE_FIREBASE_PROJECT_ID__: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID)
    }
  }
})
