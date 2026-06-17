import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export default defineConfig({
  server: {
    // Doit correspondre a l'origine autorisee par le CORS du backend Spring.
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  // L'ordre compte : paraglide AVANT tanstackStart, lui-meme AVANT React.
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/en/:path(.*)?'],
            ['pt', '/pt/:path(.*)?'],
            ['es', '/es/:path(.*)?'],
            ['zh', '/zh/:path(.*)?'],
            ['fr', '/:path(.*)?'],
          ],
        },
      ],
    }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
})
