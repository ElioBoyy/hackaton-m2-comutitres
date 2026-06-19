import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import * as React from 'react'
import { HeaderAuthZone } from '~/components/HeaderAuthZone'
import { UserSidebar } from '~/components/UserSidebar'
import { isAuthenticated, me, type MeResponse } from '~/lib/auth'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/souscription')({
  component: SouscriptionLayout,
})

function SouscriptionLayout() {
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = React.useState<MeResponse | null>(null)
  const [sidebarOuverte, setSidebarOuverte] = React.useState(false)

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    me().then(setUtilisateur).catch(() => {})
  }, [navigate])

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              aria-label="Ouvrir le menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <h1 className="font-heading text-lg font-semibold text-gray-900">
              {m.nav_my_subscriptions()}
            </h1>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <HeaderAuthZone prenom={utilisateur?.prenom ?? null} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
