import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import * as React from 'react'
import { UserSidebar } from '~/components/UserSidebar'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/recommandation')({
  component: RecommandationLayout,
})

function RecommandationLayout() {
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = React.useState<MeResponse | null>(null)

  React.useEffect(() => {
    if (isAuthenticated()) {
      me().then(setUtilisateur).catch(() => {})
    }
  }, [])

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  const prenom = utilisateur ? utilisateur.prenom : ''
  const initiale = utilisateur ? utilisateur.prenom.charAt(0).toUpperCase() : ''

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="font-heading text-lg font-semibold text-gray-900">
            {m.nav_diagnostic()}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {utilisateur && (
              <div className="flex items-center gap-2">
                <div
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
                >
                  {initiale}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {m.dashboard_hello()} {prenom}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={onLogout}
              aria-label={m.me_sign_out()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
