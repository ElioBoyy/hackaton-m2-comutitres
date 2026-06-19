import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { Pagination } from '~/components/backoffice/Pagination'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { agentMe } from '~/lib/agentAuth'
import {
  ApiError,
  getReclamationCounts,
  getReclamations,
} from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import { categorieBadge, LIBELLE_GROUPE, LIBELLE_PRIORITE, LIBELLE_STATUT } from '~/lib/reclamationBo'
import type {
  GroupeStatutReclamation,
  ReclamationCounts,
  ReclamationResumeDto,
} from '~/lib/types/reclamation'

const PAGE_SIZE = 10

export const Route = createFileRoute('/backoffice/reclamations/')({
  component: BackofficeReclamations,
})

const GROUPES: GroupeStatutReclamation[] = ['ouvert', 'en_cours', 'resolu', 'ferme']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function BackofficeReclamations() {
  const navigate = useNavigate()
  const [agentName, setAgentName] = useState<string | null>(null)
  const [groupe, setGroupe] = useState<GroupeStatutReclamation | 'tous'>('ouvert')
  const [counts, setCounts] = useState<ReclamationCounts | null>(null)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [reclamations, setReclamations] = useState<ReclamationResumeDto[]>([])
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
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) handleUnauthorized()
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) return
    getReclamationCounts({ nomClient: recherche || undefined })
      .then(setCounts)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche])

  useEffect(() => {
    if (!isAuthenticated()) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getReclamations({
      statut: groupe === 'tous' ? undefined : groupe,
      nomClient: recherche || undefined,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((response) => {
        if (cancelled) return
        setReclamations(response.reclamations)
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
        setError('Impossible de charger les réclamations pour le moment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupe, page, recherche])

  if (!agentName) return null

  function compteur(g: GroupeStatutReclamation | 'tous'): number | undefined {
    if (!counts) return undefined
    return g === 'tous' ? counts.tous
      : g === 'ouvert' ? counts.ouvert
      : g === 'en_cours' ? counts.enCours
      : g === 'resolu' ? counts.resolu
      : counts.ferme
  }

  const filtres: (GroupeStatutReclamation | 'tous')[] = ['tous', ...GROUPES]

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1) }}
            placeholder="Rechercher par nom de client…"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-dark shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-4">
            <h2 className="font-heading text-sm font-semibold text-gray-900">Réclamations</h2>
            <div className="flex flex-wrap gap-1.5">
              {filtres.map((g) => {
                const actif = groupe === g
                const n = compteur(g)
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGroupe(g); setPage(1) }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      actif ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-pale'
                    }`}
                  >
                    {g === 'tous' ? 'Toutes' : LIBELLE_GROUPE[g]}
                    {n !== undefined && <span className="ml-1.5 opacity-80">{n}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-gray-700">Chargement…</p>
          ) : error ? (
            <p className="px-4 py-10 text-center text-sm text-danger">{error}</p>
          ) : reclamations.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-700">Aucune réclamation</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Référence</th>
                    <th className="px-4 py-3 font-medium">Objet</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Catégorie</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Priorité</th>
                    <th className="px-4 py-3 font-medium">Mise à jour</th>
                  </tr>
                </thead>
                <tbody>
                  {reclamations.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate({ to: '/backoffice/reclamations/$id', params: { id: String(r.id) } })}
                      className="cursor-pointer border-b border-gray-100 transition last:border-0 hover:bg-blue-pale"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.reference}</td>
                      <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900">{r.objet}</td>
                      <td className="px-4 py-3 text-gray-700">{r.nomClient ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.libelleCategorie}</td>
                      <td className="px-4 py-3">
                        <StatusBadge libelle={LIBELLE_STATUT[r.statut] ?? r.statut} categorie={categorieBadge(r.groupeStatut)} />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{LIBELLE_PRIORITE[r.priorite] ?? r.priorite}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(r.dateMiseAJour)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </div>
      </div>
    </BackofficeLayout>
  )
}
