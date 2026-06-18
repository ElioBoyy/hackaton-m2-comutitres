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

type TabFiltre = 'ACTIVE' | 'EN_COURS' | 'FERME'
type AllData = Record<TabFiltre, DashboardResponse>

function DashboardPage() {
  const navigate = useNavigate()
  const [allData, setAllData] = useState<AllData | null>(null)
  const [filtre, setFiltre] = useState<TabFiltre>(FiltreDossiers.ACTIVE as TabFiltre)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all(
      [FiltreDossiers.ACTIVE, FiltreDossiers.EN_COURS, FiltreDossiers.FERME].map((f) => fetchDashboard(f))
    )
      .then(([active, enCours, ferme]) => {
        if (cancelled) return
        const results: AllData = {
          [FiltreDossiers.ACTIVE]: active,
          [FiltreDossiers.EN_COURS]: enCours,
          [FiltreDossiers.FERME]: ferme,
        }
        setAllData(results)
        setError(null)
        // aller sur le premier onglet non vide
        const firstNonEmpty = TABS.find((t) => results[t.filtre as TabFiltre].dossiers.length > 0)
        setFiltre(firstNonEmpty ? firstNonEmpty.filtre as TabFiltre : FiltreDossiers.ACTIVE as TabFiltre)
      })
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
  }, [navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
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

  if (!allData) return null

  const currentData = allData[filtre]
  const { prenom, nom } = currentData.utilisateur
  const userName = `${prenom} ${nom}`
  const activeTab = TABS.find((t) => t.filtre === filtre)!

  return (
    <DashboardLayout title={m.dashboard_title()} userName={userName} alertes={currentData.alertes}>
      <div className="mx-auto flex max-w-4xl flex-col">

        {/* Tabs */}
        <div className="flex border-b border-gray-200" role="tablist" aria-label={m.dashboard_title()}>
          {TABS.map((tab) => {
            const active = filtre === tab.filtre
            const empty = allData[tab.filtre as TabFiltre].dossiers.length === 0
            return (
              <button
                key={tab.filtre}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={empty}
                onClick={() => !empty && setFiltre(tab.filtre as TabFiltre)}
                className={`relative px-6 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  empty
                    ? 'cursor-not-allowed text-gray-300'
                    : active
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {active && !empty && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-5" role="tabpanel" aria-label={activeTab.label}>
          {currentData.dossiers.length === 0 ? (
            <p className="text-sm text-gray-500">{activeTab.empty}</p>
          ) : (
            currentData.dossiers.map((d) => (
              <DossierCard key={d.idDossier} dossier={d} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
