import { Link } from '@tanstack/react-router'
import { CalendarDays, HelpCircle, Home, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAuthenticated } from '~/lib/auth'
import { AppSidebar, type SidebarNavItem } from '~/components/AppSidebar'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { m } from '~/paraglide/messages'

const AUTH_ITEMS_KEYS: { labelKey: keyof typeof m; icon: SidebarNavItem['icon']; to: string }[] = [
  { labelKey: 'nav_home', icon: Home, to: '/' },
  { labelKey: 'nav_my_subscriptions', icon: CalendarDays, to: '/dashboard' },
  { labelKey: 'nav_points_de_vente', icon: MapPin, to: '/points-de-vente' },
  { labelKey: 'nav_help_contacts', icon: HelpCircle, to: '/sav' },
]

interface UserSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  /**
   * Force l'affichage du skeleton (items + CTA mobile). Permet de synchroniser
   * la duree du skeleton sidebar avec celle d'une autre zone de la page (par
   * exemple le header qui attend la fin de {@code me()}).
   */
  loading?: boolean
}

export function UserSidebar({ isOpen, onClose, loading: loadingProp }: UserSidebarProps) {
  // null = etat inconnu (SSR + 1er render client). On rend des skeletons
  // sur les zones dependant de l'auth (items nav + CTA mobile drawer) tant
  // qu'on ne sait pas, pour eviter le flash de texte au refresh.
  const [connected, setConnected] = useState<boolean | null>(null)
  useEffect(() => setConnected(isAuthenticated()), [])
  const isMobileDrawer = onClose !== undefined
  // Combine etat auth interne + override parent (ex: home synchronise sur
  // l'arrivee de me()). Si le parent dit "encore loading", on garde les
  // skeletons meme une fois connected resolu.
  const showSkeleton = connected === null || loadingProp === true

  const items: SidebarNavItem[] = AUTH_ITEMS_KEYS.map(({ labelKey, icon, to }) => ({
    label: (m[labelKey] as () => string)(),
    icon,
    to,
  }))

  const header = (
    <Link to="/" aria-label={m.authlayout_home_aria()}>
      <img src="/logo.svg" alt="Comutitres" className="h-14 w-auto" />
    </Link>
  )

  const footer = (
    <>
      {isMobileDrawer && showSkeleton && (
        <div className="mt-4 flex flex-col gap-2 lg:hidden" aria-hidden="true">
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
        </div>
      )}
      {isMobileDrawer && !showSkeleton && connected === false && (
        <div className="mt-4 flex flex-col gap-2 lg:hidden">
          <Link
            to="/login"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-blue-pale"
          >
            {m.auth_sign_in()}
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-focus"
          >
            {m.home_signup_cta()}
          </Link>
        </div>
      )}

      {/* LanguageSwitcher : visible partout (desktop + mobile) puisque les
          page headers ne l'embarquent plus. */}
      <div className="mt-4">
        <LanguageSwitcher />
      </div>

      <div className="mt-4 rounded-2xl bg-blue-pale p-4">
        <div className="mb-1 flex items-center gap-2">
          <Phone size={20} className="shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-primary">{m.help_title()}</p>
        </div>
        <p className="mb-3 text-xs text-gray-700">{m.help_subtitle()}</p>
        <Link
          to="/sav"
          hash="contact"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {m.help_contact_cta()}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )

  return (
    <AppSidebar
      header={header}
      items={items}
      footer={footer}
      isOpen={isOpen}
      onClose={onClose}
      loading={showSkeleton}
    />
  )
}
