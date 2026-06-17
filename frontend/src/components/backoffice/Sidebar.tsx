import { Link } from '@tanstack/react-router'
import { ClipboardCheck, History, LayoutDashboard, Search, Settings } from 'lucide-react'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  to?: '/backoffice/dashboard'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/backoffice/dashboard' },
  { label: 'Dossiers a verifier', icon: ClipboardCheck },
  { label: 'Recherche client', icon: Search },
  { label: 'Historique', icon: History },
  { label: 'Parametres', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-heading font-bold">
          C
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-gray-900">Comutitres</p>
          <p className="text-xs text-gray-700">Backoffice</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const content = (
            <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-pale">
              <Icon size={18} />
              {label}
            </span>
          )
          return to ? (
            <Link
              key={label}
              to={to}
              className="[&.active>span]:bg-blue-soft [&.active>span]:text-primary"
            >
              {content}
            </Link>
          ) : (
            <span key={label} className="cursor-default opacity-70">
              {content}
            </span>
          )
        })}
      </nav>
    </aside>
  )
}
