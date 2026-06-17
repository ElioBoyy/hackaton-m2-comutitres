import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, LogOut } from 'lucide-react'
import { logout } from '~/lib/auth'
import type { AlerteDashboard } from '~/lib/dashboard'

interface DashboardLayoutProps {
  userName: string
  alertes: AlerteDashboard[]
  children: ReactNode
}

export function DashboardLayout({ userName, alertes, children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const initiale = userName.charAt(0).toUpperCase()
  const hasAlertes = alertes.length > 0

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex h-16 items-center justify-end gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
        <button
          type="button"
          aria-label={hasAlertes ? `Notifications (${alertes.length} non lues)` : 'Notifications'}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <Bell size={18} aria-hidden="true" />
          {hasAlertes && (
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
          >
            {initiale}
          </div>
          <span className="hidden text-sm font-medium text-gray-900 sm:block">{userName}</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          aria-label="Se deconnecter"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6" id="main-content">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  )
}
