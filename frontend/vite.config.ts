import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // CHANGE THIS: hosts allowed to access the dev server.
    //
    // ⚠️ `true` allows ANY host — convenient for tunnels (ngrok, cloudflared, etc.)
    // in development, but do NOT use `true` in an internet-exposed deployment.
    // For production, replace with your actual domain list, e.g.:
    //
    // allowedHosts: ['yourdomain.com', 'app.yourdomain.com'],
    //
    // Docs: https://vite.dev/config/server-options.html#server-allowedhosts
    allowedHosts: true,
  },
})
