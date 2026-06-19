import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Menu } from 'lucide-react'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { UserSidebar } from '~/components/UserSidebar'
import { m } from '~/paraglide/messages'

interface DashboardLayoutProps {
  title: string
  userName?: string
  alertes?: unknown[]
  children: ReactNode
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const [sidebarOuverte, setSidebarOuverte] = useState(false)
  const [authentifie, setAuthentifie] = useState(false)
  const [utilisateur, setUtilisateur] = useState<MeResponse | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthentifie(true)
      me().then(setUtilisateur).catch(() => {})
    }
  }, [])

  function onLogout() {
    logout()
    setAuthentifie(false)
    setUtilisateur(null)
    navigate({ to: '/login' })
  }

  const prenom = utilisateur?.prenom ?? ''

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:justify-end lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOuverte(true)}
            aria-label={m.common_open_menu()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-blue-pale lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            {authentifie ? (
              <>
                {prenom && (
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden="true"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
                    >
                      {prenom.charAt(0).toUpperCase()}
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
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 transition hover:text-primary">
                  {m.auth_sign_in()}
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-focus"
                >
                  {m.home_signup_cta()}
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
