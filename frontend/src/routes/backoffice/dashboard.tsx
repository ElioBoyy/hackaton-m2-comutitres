import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { ClientSearchBar } from '~/components/backoffice/ClientSearchBar'
import { DossierStatusFilter } from '~/components/backoffice/DossierStatusFilter'
import { DossierTable } from '~/components/backoffice/DossierTable'
import { Pagination } from '~/components/backoffice/Pagination'
import { ApiError, getDossierCounts, getDossiers } from '~/lib/api'
import type { DossierCounts } from '~/lib/api'
import { agentMe } from '~/lib/agentAuth'
import { isAuthenticated, logout } from '~/lib/auth'
import type { DossierResume, StatutCategorie } from '~/lib/types/dossier'

const PAGE_SIZE = 10

export const Route = createFileRoute('/backoffice/dashboard')({
  component: BackofficeDashboard,
})

function BackofficeDashboard() {
  const navigate = useNavigate()
  const [agentName, setAgentName] = useState<string | null>(null)
  const [statut, setStatut] = useState<StatutCategorie | 'tous'>('en_cours')
  const [counts, setCounts] = useState<DossierCounts | null>(null)
  const [page, setPage] = useState(1)
  const [nomClient, setNomClient] = useState('')
  const [numeroDossier, setNumeroDossier] = useState('')
  const [dossiers, setDossiers] = useState<DossierResume[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleUnauthorized() {
    logout()
    navigate({ to: '/backoffice/login' })
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/backoffice/login' })
      return
    }
    agentMe()
      .then((agent) => setAgentName(`${agent.prenom} ${agent.nom}`))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          handleUnauthorized()
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) return
    getDossierCounts({
      nomClient: nomClient || undefined,
      numeroDossier: numeroDossier || undefined,
    })
      .then(setCounts)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomClient, numeroDossier])

  useEffect(() => {
    if (!isAuthenticated()) return
    let cancelled = false
    setLoading(true)
    setError(null)

    getDossiers({
        statut: statut === 'tous' ? undefined : statut,
        nomClient: nomClient || undefined,
        numeroDossier: numeroDossier || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      .then((response) => {
        if (cancelled) return
        setDossiers(response.dossiers)
        setTotal(response.total)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized()
          return
        }
        if (err instanceof ApiError && err.status === 403) {
          navigate({ to: '/not-found' })
          return
        }
        setError('Impossible de charger les dossiers pour le moment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statut, page, nomClient, numeroDossier])

  if (!agentName) {
    return null
  }

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      <div className="flex flex-col gap-6">
        <ClientSearchBar
          onNomClientChange={(v) => { setNomClient(v); setPage(1) }}
          onNumeroDossierChange={(v) => { setNumeroDossier(v); setPage(1) }}
        />

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
            <h2 className="font-heading text-sm font-semibold text-gray-900">
              Dossiers en attente de verification
            </h2>
            <DossierStatusFilter
              value={statut}
              counts={counts}
              onChange={(value) => {
                setStatut(value)
                setPage(1)
              }}
            />
          </div>

          <DossierTable dossiers={dossiers} loading={loading} error={error} />

          {!loading && !error && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </div>
      </div>
    </BackofficeLayout>
  )
}
