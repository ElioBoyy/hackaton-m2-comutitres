import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Convention TanStack Start : le plugin Vite appelle getRouter() cote serveur
// et cote client. routeTree.gen.ts est genere automatiquement par le plugin.
export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
