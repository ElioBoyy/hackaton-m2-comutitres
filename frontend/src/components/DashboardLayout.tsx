import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { isAuthenticated, me, type MeResponse } from '~/lib/auth'
import { HeaderAuthZone } from '~/components/HeaderAuthZone'
import { UserSidebar } from '~/components/UserSidebar'
import { m } from '~/paraglide/messages'

interface DashboardLayoutProps {
  title: string
  /** Accepte pour compat asc, plus utilise (DashboardLayout gere l'auth en interne). */
  userName?: string
  /** Accepte pour compat asc, plus utilise (la pastille notifs a ete retiree upstream). */
  alertes?: unknown[]
  children: ReactNode
  /**
   * Etat de chargement de la route parente. Propage a la sidebar (skeleton
   * sur les items + CTA mobile) et au header (skeleton sur l'avatar + nom)
   * pour que toute la chrome charge en meme temps que le contenu.
   */
  loading?: boolean
}

export function DashboardLayout({ title, children, loading }: DashboardLayoutProps) {
  const [sidebarOuverte, setSidebarOuverte] = useState(false)
  const [utilisateur, setUtilisateur] = useState<MeResponse | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      me().then(setUtilisateur).catch(() => {})
    }
  }, [])

  const prenom = utilisateur?.prenom ?? ''
  // Skeleton tant que le parent charge OU tant que me() n'a pas resolu
  // (evite le flash "logout seul" sans avatar+nom).
  const headerSkeleton = loading || (isAuthenticated() && !prenom)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} loading={loading} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              aria-label={m.common_open_menu()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-blue-pale lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-heading text-lg font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {headerSkeleton ? (
              <div className="flex items-center gap-2" aria-hidden="true">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 w-28 animate-pulse rounded-md bg-gray-100" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
              </div>
            ) : (
              <HeaderAuthZone prenom={prenom || null} />
            )}
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
