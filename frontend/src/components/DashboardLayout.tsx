import { useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, LogOut, Menu } from 'lucide-react'
import { logout } from '~/lib/auth'
import { UserSidebar } from '~/components/UserSidebar'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { m } from '~/paraglide/messages'
import type { AlerteDashboard } from '~/lib/dashboard'

interface DashboardLayoutProps {
  title: string
  userName: string
  alertes: AlerteDashboard[]
  children: ReactNode
}

export function DashboardLayout({ title, userName, alertes, children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const [sidebarOuverte, setSidebarOuverte] = useState(false)
  const initiale = userName.charAt(0).toUpperCase()
  const hasAlertes = alertes.length > 0
  const prenom = userName.split(' ')[0]

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              aria-label="Ouvrir le menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <h1 className="font-heading text-lg font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <LanguageSwitcher />
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
            </div>

            <button
              type="button"
              aria-label={
                hasAlertes
                  ? `${m.dashboard_notifications()} (${alertes.length})`
                  : m.dashboard_notifications()
              }
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Bell size={18} aria-hidden="true" />
              {hasAlertes && (
                <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
              )}
            </button>

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

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
