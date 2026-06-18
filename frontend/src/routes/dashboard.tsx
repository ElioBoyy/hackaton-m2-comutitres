import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError } from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import { fetchDashboard, FiltreDossiers, type DashboardResponse } from '~/lib/dashboard'
import { DashboardLayout } from '~/components/DashboardLayout'
import { DossierCard } from '~/components/DossierCard'
import { DossierCardSkeleton } from '~/components/DossierCardSkeleton'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

const TABS: { label: string; filtre: FiltreDossiers; empty: string }[] = [
  { label: 'Actifs',   filtre: FiltreDossiers.ACTIVE,   empty: "Aucun abonnement n'est actuellement actif." },
  { label: 'En cours', filtre: FiltreDossiers.EN_COURS, empty: 'Aucune demande en cours de traitement.' },
  { label: 'Fermés',   filtre: FiltreDossiers.FERME,    empty: "Aucun abonnement n'a été résilié ou refusé." },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<FiltreDossiers>(FiltreDossiers.ACTIVE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    fetchDashboard(filtre)
      .then((d) => { if (!cancelled) { setData(d); setError(null) } })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout()
          navigate({ to: '/login' })
          return
        }
        setError(
          err instanceof ApiError
            ? m.dashboard_error_load()
            : m.auth_server_unreachable(),
        )
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [navigate, filtre])

  /* Premier chargement : on n'a pas encore de données ni de layout → skeleton pleine page */
  if (!data && loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* sidebar placeholder */}
        <div className="hidden w-64 shrink-0 md:block" />
        <div className="flex flex-1 flex-col">
          <div className="h-16 border-b border-gray-200 bg-white" />
          <main className="flex-1 p-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-5" aria-busy="true" aria-label={m.dashboard_loading()}>
              {[1, 2].map((i) => <DossierCardSkeleton key={i} />)}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p role="alert" className="text-sm text-danger">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { prenom, nom } = data.utilisateur
  const userName = `${prenom} ${nom}`
  const activeTab = TABS.find((t) => t.filtre === filtre)!

  return (
    <DashboardLayout title={m.dashboard_title()} userName={userName} alertes={data.alertes}>
      <div className="mx-auto flex max-w-4xl flex-col">

        {/* Tabs — toujours visibles */}
        <div className="flex border-b border-gray-200" role="tablist" aria-label={m.dashboard_title()}>
          {TABS.map((tab) => {
            const active = filtre === tab.filtre
            return (
              <button
                key={tab.filtre}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFiltre(tab.filtre)}
                className={`relative px-6 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-5" role="tabpanel" aria-label={activeTab.label}>
          {loading && [1, 2].map((i) => <DossierCardSkeleton key={i} />)}

          {!loading && data.dossiers.length === 0 && (
            <p className="text-sm text-gray-500">{activeTab.empty}</p>
          )}

          {!loading && data.dossiers.map((d) => (
            <DossierCard key={d.idDossier} dossier={d} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
