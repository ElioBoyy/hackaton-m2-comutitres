import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
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

/* ─── Illustration mapping par code ────────────────────────────────── */

type IllustrationComponent = ComponentType<{ className?: string }>

function illustrationFor(code: string): IllustrationComponent {
  if (code.startsWith('IMAGINE_R')) return ImagineRIllustration
  if (code === 'AMETHYSTE' || code === 'NAVIGO_SENIOR') return AmethysteIllustration
  if (code === 'TRANSPORT_SCOLAIRE') return TransportScolaireIllustration
  return NavigoIllustration
}

function bgFor(code: string): string {
  if (code.startsWith('IMAGINE_R')) return '#4a90d9'
  if (code === 'AMETHYSTE') return '#c4687a'
  if (code === 'NAVIGO_SENIOR') return '#c4687a'
  if (code.startsWith('SOLIDARITE')) return '#e72f69'
  if (code === 'TRANSPORT_SCOLAIRE') return '#e72f69'
  return '#9185be'
}

function formatPrix(abo: TypeAbonnement): string {
  if (abo.tarifPlein === null) return 'Tarif social'
  if (abo.tarifPlein === 0) return 'Gratuit'
  const n = Number(abo.tarifPlein)
  const formatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
  switch (abo.periodicite) {
    case 'annuelle': return `${formatted} / an`
    case 'mensuelle': return `${formatted} / mois`
    case 'hebdomadaire': return `${formatted} / sem.`
    default: return formatted
  }
}

/* ─── Card ───────────────────────────────────────────────────────────── */

function AbonnementCard({ abo }: { abo: TypeAbonnement }) {
  const Illustration = illustrationFor(abo.code)
  const bg = bgFor(abo.code)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-center py-6" style={{ backgroundColor: bg }}>
        <Illustration className="h-20 w-auto" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {abo.categorie ?? '—'}
          </p>
          <h3 className="mt-0.5 font-heading text-base font-bold text-gray-900">{abo.libelle}</h3>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: bg }}
          >
            {formatPrix(abo)}
          </span>
          <Link
            to="/recommandation"
            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-focus"
          >
            Demander
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-32 animate-pulse bg-gray-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 flex justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

function HomePage() {
  const [abonnements, setAbonnements] = useState<TypeAbonnement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAbonnements()
      .then(setAbonnements)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="font-heading text-lg font-bold text-gray-900">
            Les abonnements disponibles
          </h1>
          <div className="flex items-center gap-3">
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
            className="mb-5 flex items-center justify-between gap-4 rounded-2xl p-4"
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
              className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-blue-pale"
            >
              Trouver mon abonnement
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : abonnements.map((abo) => <AbonnementCard key={abo.code} abo={abo} />)
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
