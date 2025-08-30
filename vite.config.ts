import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Necessário para acessar via IP/ngrok
    hmr: {
      // Desativa o HMR quando estiver usando ngrok
      clientPort: 443
    },
    allowedHosts: ['localhost', '192.168.1.100', 'b619-187-85-16-24.ngrok-free.app'],
  },
  envDir: './',
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}) 