import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError } from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import { fetchDashboard, FiltreDossiers, type DashboardResponse } from '~/lib/dashboard'
import { DashboardLayout } from '~/components/DashboardLayout'
import { DossierCard } from '~/components/DossierCard'
import { DossierCardSkeleton } from '~/components/DossierCardSkeleton'
import { Pagination } from '~/components/backoffice/Pagination'
import { m } from '~/paraglide/messages'

const PAGE_SIZE = 10

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

type TabFiltre = 'ACTIVE' | 'EN_COURS' | 'FERME' | 'TOUS'
type AllData = Record<TabFiltre, DashboardResponse>

const TABS: { label: string; filtre: TabFiltre; empty: string }[] = [
  { label: 'Actifs',                  filtre: 'ACTIVE',   empty: "Aucun abonnement n'est actuellement actif." },
  { label: 'Mes procédures en cours', filtre: 'EN_COURS', empty: 'Aucune demande en cours de traitement.' },
  { label: 'Fermés',                  filtre: 'FERME',    empty: "Aucun abonnement n'a été résilié ou refusé." },
  { label: 'TOUS',                    filtre: 'TOUS',     empty: 'Aucun dossier trouvé.' },
]

const VALID_TABS = new Set<string>(TABS.map((t) => t.filtre))
const STORAGE_KEY = 'dashboard_tab'

function savedTab(): TabFiltre {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    return v && VALID_TABS.has(v) ? (v as TabFiltre) : 'ACTIVE'
  } catch {
    return 'ACTIVE'
  }
}

function saveTab(tab: TabFiltre) {
  try { sessionStorage.setItem(STORAGE_KEY, tab) } catch { /* ignore */ }
}

function DashboardPage() {
  const navigate = useNavigate()
  const [allData, setAllData] = useState<AllData | null>(null)
  const [filtre, setFiltre] = useState<TabFiltre>(savedTab())
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function changeFiltre(next: TabFiltre) {
    setFiltre(next)
    setPage(1)
    saveTab(next)
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchDashboard(FiltreDossiers.ACTIVE),
      fetchDashboard(FiltreDossiers.EN_COURS),
      fetchDashboard(FiltreDossiers.FERME),
      fetchDashboard(FiltreDossiers.ALL),
    ])
      .then(([active, enCours, ferme, tous]) => {
        if (cancelled) return
        // Trier TOUS par date de création décroissante
        tous.dossiers.sort(
          (a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        )
        const results: AllData = {
          ACTIVE: active,
          EN_COURS: enCours,
          FERME: ferme,
          TOUS: tous,
        }
        setAllData(results)
        setError(null)
        // Garder le tab sauvegardé s'il a des données ; sinon aller sur le premier non vide
        const current = savedTab()
        if (results[current].dossiers.length > 0) {
          setFiltre(current)
        } else {
          const firstNonEmpty = TABS.find((t) => results[t.filtre].dossiers.length > 0)
          const next = firstNonEmpty ? firstNonEmpty.filtre : 'ACTIVE'
          setFiltre(next)
          saveTab(next)
        }
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
  const allDossiers = currentData.dossiers
  const totalDossiers = allDossiers.length
  const pageDossiers = allDossiers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DashboardLayout title={m.dashboard_title()} userName={userName} alertes={currentData.alertes}>
      <div className="mx-auto flex max-w-4xl flex-col">

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200" role="tablist" aria-label={m.dashboard_title()}>
          {TABS.map((tab) => {
            const active = filtre === tab.filtre
            const empty = allData[tab.filtre].dossiers.length === 0
            return (
              <button
                key={tab.filtre}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={empty}
                onClick={() => !empty && changeFiltre(tab.filtre)}
                className={`relative px-5 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
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
          {totalDossiers === 0 ? (
            <p className="text-sm text-gray-500">{activeTab.empty}</p>
          ) : (
            <>
              {pageDossiers.map((d) => (
                <DossierCard key={d.idDossier} dossier={d} />
              ))}
              {totalDossiers > PAGE_SIZE && (
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={totalDossiers}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
