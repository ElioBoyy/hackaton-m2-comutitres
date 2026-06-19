import { Link } from '@tanstack/react-router'
import { X, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { m } from '~/paraglide/messages'

/**
 * Item de navigation pour la sidebar. {@code label} est passe directement comme
 * texte (les callers cote client passent {@code m.nav_xxx()}), {@code to} est
 * une route TanStack ({@code "/" | "/dashboard" | ...}).
 */
export interface SidebarNavItem {
  label: string
  icon: LucideIcon
  to: string
  /** aria-label optionnel ; defaut = label. */
  ariaLabel?: string
}

export interface AppSidebarProps {
  /** En-tete de la sidebar (logo + sous-titre eventuel). */
  header: ReactNode
  /** Items de navigation a afficher. */
  items: SidebarNavItem[]
  /** Contenu pied de sidebar (CTA aide, lang switcher, etc.). Optionnel. */
  footer?: ReactNode
  /** Mode drawer mobile : si fourni, la sidebar devient un drawer overlay. */
  isOpen?: boolean
  /** Callback fermeture mobile (si fourni active le mode drawer). */
  onClose?: () => void
  /**
   * Affiche un skeleton a la place des items (meme nombre que {@code items})
   * pendant la phase de chargement initial. Utilise pour eviter le decalage
   * visuel quand le reste de la page est aussi en skeleton.
   */
  loading?: boolean
}

/**
 * Sidebar generique partagee entre l'espace client et le backoffice : seul le
 * contenu (items, header, footer) change, le chrome (largeur, drawer mobile,
 * couleur de selection) est identique.
 *
 * <p>La couleur de selection {@code bg-blue-soft text-primary} (style
 * backoffice) est appliquee partout pour harmoniser les deux espaces.
 */
export function AppSidebar({ header, items, footer, isOpen, onClose, loading }: AppSidebarProps) {
  const isMobileDrawer = onClose !== undefined

  return (
    <>
      {isMobileDrawer && isOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          'flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4',
          isMobileDrawer
            ? `fixed inset-0 right-auto z-[1001] transition-transform duration-200 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'hidden lg:flex h-screen overflow-y-auto',
        ].join(' ')}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          {header}
          {isMobileDrawer && (
            <button
              type="button"
              onClick={onClose}
              aria-label={m.common_close_menu()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-blue-pale lg:hidden"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <nav
          className="flex flex-1 flex-col gap-1"
          aria-label={m.nav_main_aria()}
        >
          {loading
            ? Array.from({ length: items.length || 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  aria-hidden="true"
                >
                  <div className="h-[18px] w-[18px] shrink-0 animate-pulse rounded bg-gray-100" />
                  <div
                    className="h-4 animate-pulse rounded bg-gray-100"
                    style={{ width: `${60 + ((i * 17) % 40)}%` }}
                  />
                </div>
              ))
            : items.map(({ label, icon: Icon, to, ariaLabel }) => (
                <Link
                  key={to}
                  to={to as never}
                  aria-label={ariaLabel ?? label}
                  className="[&.active>span]:bg-blue-soft [&.active>span]:text-primary [&.active>span]:font-semibold"
                >
                  <span className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-blue-pale">
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </span>
                </Link>
              ))}
        </nav>

        {footer}
      </aside>
    </>
  )
}
