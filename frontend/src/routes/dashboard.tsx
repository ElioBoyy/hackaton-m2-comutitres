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

type Tab = { label: () => string; filtre: TabFiltre; empty: () => string }

function buildTabs(): Tab[] {
  return [
    { label: m.dashboard_filter_active,   filtre: 'ACTIVE',   empty: m.dashboard_no_active },
    { label: m.dashboard_filter_en_cours, filtre: 'EN_COURS', empty: m.dashboard_no_en_cours },
    { label: m.dashboard_filter_ferme,    filtre: 'FERME',    empty: m.dashboard_no_ferme },
    { label: m.dashboard_filter_all,      filtre: 'TOUS',     empty: m.dashboard_no_tous },
  ]
}

const TABS = buildTabs()

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p role="alert" className="text-sm text-danger">{error}</p>
      </div>
    )
  }

  const currentData = allData?.[filtre]
  const userName = currentData ? `${currentData.utilisateur.prenom} ${currentData.utilisateur.nom}` : ''
  const activeTab = TABS.find((t) => t.filtre === filtre)!
  const allDossiers = currentData?.dossiers ?? []
  const totalDossiers = allDossiers.length
  const pageDossiers = allDossiers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DashboardLayout
      title={m.dashboard_title()}
      userName={userName}
      alertes={currentData?.alertes ?? []}
      loading={loading}
    >
      <div className="mx-auto flex max-w-4xl flex-col">

        {/* Tabs — toujours visibles, meme en loading (pas de "empty" state
            tant qu'on ne connait pas les counts). */}
        <div className="flex flex-wrap border-b border-gray-200" role="tablist" aria-label={m.dashboard_title()}>
          {TABS.map((tab) => {
            const active = filtre === tab.filtre
            const empty = !loading && allData ? allData[tab.filtre].dossiers.length === 0 : false
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
                {tab.label()}
                {active && !empty && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>

        <div
          className="mt-5 flex flex-col gap-5"
          role="tabpanel"
          aria-label={activeTab.label()}
          aria-busy={loading || undefined}
        >
          {loading ? (
            [1, 2].map((i) => <DossierCardSkeleton key={i} />)
          ) : totalDossiers === 0 ? (
            <p className="text-sm text-gray-500">{activeTab.empty()}</p>
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
