import { Link } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { AppSidebar, type SidebarNavItem } from '~/components/AppSidebar'

const ITEMS: SidebarNavItem[] = [
  { label: 'Dossiers', icon: LayoutDashboard, to: '/backoffice/dashboard' },
]

export function Sidebar() {
  const header = (
    <Link to="/backoffice/dashboard" aria-label="Comutitres backoffice" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-heading font-bold">
        C
      </div>
      <div>
        <p className="font-heading text-sm font-semibold text-gray-900">Comutitres</p>
        <p className="text-xs text-gray-700">Backoffice</p>
      </div>
    </Link>
  )

  return <AppSidebar header={header} items={ITEMS} />
}
