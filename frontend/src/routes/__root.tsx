/// <reference types="vite/client" />
import * as React from 'react'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '~/styles/app.css?url'
import { StoreProvider } from '~/store/StoreProvider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'jegeremacartenavigo' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 py-12 text-center">
      <h1 className="font-heading text-2xl font-bold text-dark">Page introuvable</h1>
      <p className="text-gray-700">Cette page n'existe pas.</p>
    </main>
  )
}

function RootComponent() {
  return (
    <RootDocument>
      <StoreProvider>
        <Outlet />
      </StoreProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
