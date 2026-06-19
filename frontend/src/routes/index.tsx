import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Info, LogOut, Menu, Sparkles, X } from 'lucide-react'
import { UserSidebar } from '~/components/UserSidebar'
import { NavigoIllustration } from '~/components/illustrations/NavigoIllustration'
import { ImagineRIllustration } from '~/components/illustrations/ImagineRIllustration'
import { AmethysteIllustration } from '~/components/illustrations/AmethysteIllustration'
import { TransportScolaireIllustration } from '~/components/illustrations/TransportScolaireIllustration'
import { getAbonnements, type TypeAbonnement } from '~/lib/api'
import { TransportBadges, ZoneBadges } from '~/components/TransportZoneBadges'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { m } from '~/paraglide/messages'
import type { ComponentType } from 'react'



export const Route = createFileRoute('/')({
  component: HomePage,
})

/* ─── Category config ────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, { bg: string; text: string; modalText?: string }> = {
  'Navigo standard':           { bg: '#9185be', text: '#9185be' },
  'Forfait scolaire-etudiant': { bg: '#deeeff', text: '#0050aa', modalText: '#64b5f6' },
  'Forfait senior':            { bg: '#ffa3a3', text: '#ffa3a3' },
  'Tarification solidaire':    { bg: '#e72f69', text: '#e72f69' },
}

const CATEGORY_ORDER = [
  'Navigo standard',
  'Forfait scolaire-etudiant',
  'Forfait senior',
  'Tarification solidaire',
]

/* ─── Card helpers ───────────────────────────────────────────────────── */

function illustrationFor(code: string): ComponentType<{ className?: string }> {
  if (code.startsWith('IMAGINE_R')) return ImagineRIllustration
  if (code === 'AMETHYSTE' || code === 'NAVIGO_SENIOR') return AmethysteIllustration
  if (code === 'TRANSPORT_SCOLAIRE') return TransportScolaireIllustration
  return NavigoIllustration
}

function cardBgFor(code: string, categoryHex: string): string {
  if (code.startsWith('IMAGINE_R') || code === 'TRANSPORT_SCOLAIRE') return '#deeeff'
  return categoryHex
}

function badgeTextFor(bg: string): string {
  // parse luminance from hex to pick white or dark text
  const hex = bg.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.85 ? '#0050aa' : '#ffffff'
}

function formatPrix(abo: TypeAbonnement): string {
  if (abo.tarifPlein === null) return m.abo_price_social()
  if (abo.tarifPlein === 0) return m.abo_price_free()
  const n = Number(abo.tarifPlein)
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  switch (abo.periodicite) {
    case 'annuelle':     return m.abo_price_per_year({ price: formatted })
    case 'mensuelle':    return m.abo_price_per_month({ price: formatted })
    case 'hebdomadaire': return m.abo_price_per_week({ price: formatted })
    default:             return formatted
  }
}

function formatPrixParts(abo: TypeAbonnement): { value: string; suffix: string } {
  if (abo.tarifPlein === null) return { value: 'Tarif social', suffix: '' }
  if (abo.tarifPlein === 0) return { value: 'Gratuit', suffix: '' }
  const n = Number(abo.tarifPlein)
  const value = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  switch (abo.periodicite) {
    case 'annuelle':     return { value, suffix: '/ an' }
    case 'mensuelle':    return { value, suffix: '/ mois' }
    case 'hebdomadaire': return { value, suffix: '/ sem.' }
    default:             return { value, suffix: '' }
  }
}

/* ─── Modal détail abonnement ────────────────────────────────────────── */

function AbonnementModal({ abo, categoryHex, modalColor, onClose }: { abo: TypeAbonnement; categoryHex: string; modalColor?: string; onClose: () => void }) {
  const navigate = useNavigate()
  const Illustration = illustrationFor(abo.code)
  const bg = cardBgFor(abo.code, categoryHex)
  const badgeText = badgeTextFor(bg)
  const titleColor = modalColor ?? bg

  function handleDemande() {
    onClose()
    void navigate({ to: '/souscription/detail', search: { code: abo.code } })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer (mobile : positionné en absolu en haut à droite) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow hover:bg-gray-100 sm:hidden"
        >
          <X size={18} />
        </button>

        {/* Colonne image */}
        <div className="flex shrink-0 items-center justify-center p-6 sm:w-52 sm:p-8">
          <img src="/navigo-card-transparent.png" alt={abo.libelle} className="h-32 w-auto object-contain -rotate-6 drop-shadow-md sm:h-auto sm:w-full" />
        </div>

        {/* Colonne contenu */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading text-base font-bold" style={{ color: titleColor }}>{abo.libelle}</h2>
            <button
              type="button"
              onClick={onClose}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 sm:flex"
            >
              <X size={18} />
            </button>
          </div>

          {abo.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{abo.description}</p>
          )}

          <TransportBadges transports={abo.transports} />
          <ZoneBadges zones={abo.zones} />

          {/* Prix + CTA */}
          <div className="mt-auto flex flex-col gap-1.5 border-t border-gray-100 pt-3">
            <div className="flex items-baseline gap-1.5">
              {(() => { const { value, suffix } = formatPrixParts(abo); return <><span className="font-heading text-2xl font-bold" style={{ color: titleColor }}>{value}</span>{suffix && <span className="text-base font-semibold text-dark">{suffix}</span>}</> })()}
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDemande}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-focus"
            >
              {m.abo_modal_request_cta()}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Abonnement card ────────────────────────────────────────────────── */

const ILLUSTRATIONS = ['/navigo-illustration.svg', '/navigo-illustration-2.svg']

function AbonnementCard({ abo, categoryHex, categoryModalText }: { abo: TypeAbonnement; categoryHex: string; categoryModalText?: string }) {
  const [open, setOpen] = useState(false)
  const Illustration = illustrationFor(abo.code)
  const bg = cardBgFor(abo.code, categoryHex)
  const badgeText = badgeTextFor(bg)
  const illustration = (abo.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 7 === 0) ? ILLUSTRATIONS[1] : ILLUSTRATIONS[0]

  return (
    <>
      <article className="flex h-64 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="relative shrink-0 overflow-hidden bg-blue-pale" style={{ height: '7rem' }}>
          <img src={illustration} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="font-heading text-sm font-bold" style={{ color: badgeText === '#ffffff' ? bg : badgeText }}>{abo.libelle}</h3>
          {abo.description && (
            <p className="text-xs text-gray-500 leading-snug">{abo.description}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: bg, color: badgeText }}
            >
              {formatPrix(abo)}
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-focus"
            >
              <Info size={11} />
              {m.abo_more_info()}
            </button>
          </div>
        </div>
      </article>
      {open && <AbonnementModal abo={abo} categoryHex={categoryHex} modalColor={categoryModalText} onClose={() => setOpen(false)} />}
    </>
  )
}

/* ─── Carousel ───────────────────────────────────────────────────────── */

const CARD_W = 200 // approximate card width + gap for scroll step


function Carousel({ categorie, items }: { categorie: string; items: TypeAbonnement[] }) {
  const cfg = CATEGORY_CONFIG[categorie] ?? { bg: '#9185be', text: '#9185be' }
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  function updateArrows() {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scroll(dir: 'left' | 'right') {
    trackRef.current?.scrollBy({ left: dir === 'left' ? -CARD_W * 2 : CARD_W * 2, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Titre catégorie */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: cfg.text }}>{categorie}</span>
        <div className="h-px flex-1 opacity-30" style={{ backgroundColor: cfg.text }} />
      </div>

    <div className="relative">
      {/* Arrow left */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label={m.common_previous()}
        className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 hidden h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:flex ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((abo, idx) => (
          <div key={abo.code} className="shrink-0 w-64">
            <AbonnementCard abo={abo} categoryHex={cfg.bg} categoryModalText={cfg.modalText} />
          </div>
        ))}
      </div>

      {/* Arrow right */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label={m.common_next()}
        className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 hidden h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:flex ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
    </div>
  )
}

/* ─── Skeletons ──────────────────────────────────────────────────────── */

function CarouselSkeleton() {
  return (
    <div className="flex gap-3 px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 rounded-2xl">
          <div className="h-24 animate-pulse rounded-t-2xl bg-gray-200" />
          <div className="h-20 animate-pulse rounded-b-2xl bg-gray-100 mt-0.5" />
        </div>
      ))}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

function HomePage() {
  const navigate = useNavigate()
  const [abonnements, setAbonnements] = useState<TypeAbonnement[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authentifie, setAuthentifie] = useState(false)
  const [utilisateur, setUtilisateur] = useState<MeResponse | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthentifie(true)
      me().then(setUtilisateur).catch(() => {})
    }
    getAbonnements()
      .then(setAbonnements)
      .finally(() => setLoading(false))
  }, [])

  function onLogout() {
    logout()
    setAuthentifie(false)
    setUtilisateur(null)
    navigate({ to: '/login' })
  }

  const prenom = utilisateur?.prenom ?? ''

  const grouped = CATEGORY_ORDER.map((cat) => ({
    categorie: cat,
    items: abonnements.filter((a) => a.categorie === cat),
  })).filter((g) => g.items.length > 0)

  // Catch any unknown category
  const knownSet = new Set(CATEGORY_ORDER)
  const extra = abonnements.filter((a) => a.categorie && !knownSet.has(a.categorie))
  if (extra.length > 0) {
    const map = extra.reduce<Record<string, TypeAbonnement[]>>((acc, a) => {
      const key = a.categorie ?? 'Autres'
      acc[key] = [...(acc[key] ?? []), a]
      return acc
    }, {})
    Object.entries(map).forEach(([cat, items]) => grouped.push({ categorie: cat, items }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:justify-end lg:pl-6 lg:pr-10">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={m.common_open_menu()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-blue-pale lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Auth zone — desktop only */}
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

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {/* CTA banner */}
          <Link to="/recommandation" className="relative mb-5 block overflow-hidden rounded-2xl cursor-pointer" style={{ minHeight: '13rem' }}>
            <img
              src="/train-banner.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '50% 60%' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(0,50,120,0.82) 40%, rgba(0,50,120,0.3))' }}
            />
            <div className="relative flex h-full flex-col justify-center gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" style={{ minHeight: '13rem' }}>
              <div>
                <p className="font-heading text-sm font-semibold text-white">
                  {m.home_recommend_title()}
                </p>
                <p className="text-xs text-white/70">
                  {m.home_recommend_subtitle()}
                </p>
              </div>
              <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-pale sm:w-auto sm:shrink-0">
                Je trouve mon abonnement
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Carousels */}
          <div className="flex flex-col gap-10">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CarouselSkeleton key={i} />)
              : grouped.map(({ categorie, items }) => (
                  <Carousel key={categorie} categorie={categorie} items={items} />
                ))
            }
          </div>

          <footer className="mt-6 flex items-center justify-between text-xs text-gray-400">
            <p>© 2026 Comutitres — Île-de-France Mobilités</p>
            <div className="flex gap-4">
              <Link to="/aide" className="hover:text-gray-600 transition-colors">Aide</Link>
              <Link to="/aide" hash="contact" className="hover:text-gray-600 transition-colors">Contact</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
