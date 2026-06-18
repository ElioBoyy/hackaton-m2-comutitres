import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Info, Menu, Sparkles, X } from 'lucide-react'
import { UserSidebar } from '~/components/UserSidebar'
import { NavigoIllustration } from '~/components/illustrations/NavigoIllustration'
import { ImagineRIllustration } from '~/components/illustrations/ImagineRIllustration'
import { AmethysteIllustration } from '~/components/illustrations/AmethysteIllustration'
import { TransportScolaireIllustration } from '~/components/illustrations/TransportScolaireIllustration'
import { getAbonnements, type TypeAbonnement } from '~/lib/api'
import type { ComponentType } from 'react'



export const Route = createFileRoute('/')({
  component: HomePage,
})

/* ─── Category config ────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<string, { bg: string; text: string }> = {
  'Navigo standard':           { bg: '#9185be', text: '#9185be' },
  'Forfait scolaire-etudiant': { bg: '#deeeff', text: '#4a90d9' },
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
  return luminance > 0.85 ? '#1972d2' : '#ffffff'
}

function formatPrix(abo: TypeAbonnement): string {
  if (abo.tarifPlein === null) return 'Tarif social'
  if (abo.tarifPlein === 0) return 'Gratuit'
  const n = Number(abo.tarifPlein)
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  switch (abo.periodicite) {
    case 'annuelle':     return `${formatted} / an`
    case 'mensuelle':    return `${formatted} / mois`
    case 'hebdomadaire': return `${formatted} / sem.`
    default:             return formatted
  }
}

/* ─── Modal détail abonnement ────────────────────────────────────────── */

function AbonnementModal({ abo, categoryHex, onClose }: { abo: TypeAbonnement; categoryHex: string; onClose: () => void }) {
  const Illustration = illustrationFor(abo.code)
  const bg = cardBgFor(abo.code, categoryHex)
  const badgeText = badgeTextFor(bg)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header coloré */}
        <div className="relative flex items-center justify-center py-8" style={{ backgroundColor: bg }}>
          <Illustration className="h-32 w-full" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30"
          >
            <X size={14} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-base font-bold text-gray-900">{abo.libelle}</h2>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: bg, color: badgeText }}
            >
              {formatPrix(abo)}
            </span>
          </div>

          {abo.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{abo.description}</p>
          )}

          {abo.transports.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Transports</p>
              <div className="flex flex-wrap gap-1.5">
                {abo.transports.map((t) => (
                  <span key={t} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{t}</span>
                ))}
              </div>
            </div>
          )}

          {abo.zones.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Zones</p>
              <div className="flex flex-wrap gap-1.5">
                {abo.zones.map((z) => (
                  <span key={z} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{z}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Abonnement card ────────────────────────────────────────────────── */

function AbonnementCard({ abo, categoryHex }: { abo: TypeAbonnement; categoryHex: string }) {
  const [open, setOpen] = useState(false)
  const Illustration = illustrationFor(abo.code)
  const bg = cardBgFor(abo.code, categoryHex)
  const badgeText = badgeTextFor(bg)

  return (
    <>
      <article className="flex h-72 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="relative shrink-0 overflow-hidden" style={{ backgroundColor: bg, height: '9rem' }}>
          <Illustration className="absolute inset-0 h-full w-full" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="font-heading text-sm font-bold text-gray-900">{abo.libelle}</h3>
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
              + d'infos
            </button>
          </div>
        </div>
      </article>
      {open && <AbonnementModal abo={abo} categoryHex={categoryHex} onClose={() => setOpen(false)} />}
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
        aria-label="Précédent"
        className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 hidden h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:flex ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-3 overflow-x-auto scroll-smooth px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((abo) => (
          <div key={abo.code} className="shrink-0 w-64">
            <AbonnementCard abo={abo} categoryHex={cfg.bg} />
          </div>
        ))}
      </div>

      {/* Arrow right */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Suivant"
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
  const [abonnements, setAbonnements] = useState<TypeAbonnement[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getAbonnements()
      .then(setAbonnements)
      .finally(() => setLoading(false))
  }, [])

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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:justify-end lg:px-6">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-blue-pale lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Auth links — desktop only */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="text-sm font-medium text-gray-600 transition hover:text-primary">
              Connexion
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-focus"
            >
              Créer un compte
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {/* CTA banner */}
          <div
            className="mb-5 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ background: 'linear-gradient(to right, #1972d2, #0050aa)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-white">
                  Vous ne savez pas quel abonnement choisir ?
                </p>
                <p className="text-xs text-white/70">
                  Répondez à quelques questions, notre copilot vous guide.
                </p>
              </div>
            </div>
            <Link
              to="/recommandation"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-blue-pale sm:w-auto sm:shrink-0"
            >
              Trouver mon abonnement
              <ArrowRight size={14} />
            </Link>
          </div>

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
              <Link to="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
