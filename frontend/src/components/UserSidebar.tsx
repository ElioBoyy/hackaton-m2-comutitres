import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  FileText,
  HelpCircle,
  Home,
  MessageCircle,
  Search,
  Settings,
  ScanSearch,
  User,
  X,
} from 'lucide-react'
import { isAuthenticated } from '~/lib/auth'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { m } from '~/paraglide/messages'

interface NavItem {
  labelKey: keyof typeof m
  icon: typeof Home
  to?: string
}

const PUBLIC_ITEMS: NavItem[] = [
  { labelKey: 'nav_home', icon: Home, to: '/' },
  { labelKey: 'nav_diagnostic', icon: ScanSearch, to: '/recommandation' },
  { labelKey: 'nav_help_contacts', icon: HelpCircle, to: '/aide' },
]

const AUTH_ITEMS: NavItem[] = [
  { labelKey: 'nav_home', icon: Home, to: '/' },
  { labelKey: 'nav_search_subscription', icon: Search },
  { labelKey: 'nav_diagnostic', icon: ScanSearch, to: '/recommandation' },
  { labelKey: 'nav_my_subscriptions', icon: CalendarDays, to: '/dashboard' },
  { labelKey: 'nav_my_documents', icon: FileText, to: '/mes-documents' },
  { labelKey: 'nav_my_info', icon: User },
  { labelKey: 'nav_help_contacts', icon: HelpCircle, to: '/sav' },
  { labelKey: 'nav_settings', icon: Settings },
]

interface UserSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const connected = isAuthenticated()
  const items = connected ? AUTH_ITEMS : PUBLIC_ITEMS
  const isMobileDrawer = onClose !== undefined

  return (
    <>
      {isMobileDrawer && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside className={[
        'flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4',
        isMobileDrawer
          ? `fixed inset-0 right-auto z-30 transition-transform duration-200 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'hidden lg:flex h-screen overflow-y-auto',
      ].join(' ')}>
        <div className="mb-8 flex items-center justify-between px-2">
          <Link to="/" aria-label="Comutitres - accueil">
            <img src="/logo.svg" alt="Comutitres" className="h-14 w-auto" />
          </Link>
          {isMobileDrawer && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le menu"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-blue-pale lg:hidden"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation principale">
          {items.map(({ labelKey, icon: Icon, to }) => {
            const label = (m[labelKey] as () => string)()
            const content = (
              <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-pale">
                <Icon size={18} aria-hidden="true" />
                {label}
              </span>
            )
            if (to) {
              return (
                <Link
                  key={labelKey}
                  to={to as any}
                  aria-label={label}
                  className="[&.active>span]:bg-focus [&.active>span]:text-white [&.active>span]:font-semibold"
                >
                  {content}
                </Link>
              )
            }
            return (
              <span
                key={labelKey}
                className="cursor-default opacity-50"
                aria-disabled="true"
                title={m.nav_coming_soon()}
              >
                {content}
              </span>
            )
          })}
        </nav>

        {isMobileDrawer && (
          <div className="mt-4 lg:hidden">
            <LanguageSwitcher />
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-blue-pale p-4">
            <div className="mb-1 flex items-center gap-2">
              <MessageCircle size={20} className="shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-primary">{m.help_title()}</p>
            </div>
            <p className="mb-3 text-xs text-gray-700">{m.help_subtitle()}</p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {m.help_contact_cta()}
              <span aria-hidden="true">→</span>
            </a>
          </div>
      </aside>
    </>
  )
}
