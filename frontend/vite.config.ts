import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    // Doit correspondre a l'origine autorisee par le CORS du backend Spring
    // (app.cors.allowed-origins -> http://localhost:3000).
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  // L'ordre compte : le plugin TanStack Start avant le plugin React.
  plugins: [tanstackStart(), viteReact(), tailwindcss()],
})
