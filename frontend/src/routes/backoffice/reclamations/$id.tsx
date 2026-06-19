import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Send, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { Button } from '~/components/Button'
import { agentMe } from '~/lib/agentAuth'
import {
  ApiError,
  assignerReclamation,
  changerStatutReclamation,
  getReclamationDetail,
  repondreReclamationAgent,
} from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import { categorieBadge, LIBELLE_PRIORITE, LIBELLE_STATUT, STATUTS_AGENT } from '~/lib/reclamationBo'
import type { ReclamationDetailDto } from '~/lib/types/reclamation'

export const Route = createFileRoute('/backoffice/reclamations/$id')({
  component: ReclamationDetailPage,
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function ReclamationDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [agentName, setAgentName] = useState<string | null>(null)
  const [reclamation, setReclamation] = useState<ReclamationDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reponse, setReponse] = useState('')
  const [action, setAction] = useState(false)

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
    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function charger() {
    setLoading(true)
    setError(null)
    getReclamationDetail(id)
      .then(setReclamation)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          handleUnauthorized()
          return
        }
        setError('Réclamation introuvable.')
      })
      .finally(() => setLoading(false))
  }

  async function handleStatut(statut: string) {
    setAction(true)
    try {
      setReclamation(await changerStatutReclamation(id, statut))
    } catch {
      setError("Échec du changement de statut.")
    } finally {
      setAction(false)
    }
  }

  async function handleAssigner() {
    setAction(true)
    try {
      setReclamation(await assignerReclamation(id))
    } catch {
      setError("Échec de l'assignation.")
    } finally {
      setAction(false)
    }
  }

  async function handleRepondre() {
    const texte = reponse.trim()
    if (!texte || action) return
    setAction(true)
    try {
      setReclamation(await repondreReclamationAgent(id, texte))
      setReponse('')
    } catch {
      setError("Échec de l'envoi de la réponse.")
    } finally {
      setAction(false)
    }
  }

  if (!agentName) return null

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link to="/backoffice/reclamations" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux réclamations
        </Link>

        {loading ? (
          <p className="py-10 text-center text-sm text-gray-700">Chargement…</p>
        ) : error && !reclamation ? (
          <p className="py-10 text-center text-sm text-danger">{error}</p>
        ) : reclamation ? (
          <>
            {error && (
              <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            {/* En-tete */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-700">{reclamation.reference}</span>
                    <StatusBadge
                      libelle={LIBELLE_STATUT[reclamation.statut] ?? reclamation.statut}
                      categorie={categorieBadge(reclamation.groupeStatut)}
                    />
                  </div>
                  <h1 className="mt-1 font-heading text-lg font-semibold text-gray-900">{reclamation.objet}</h1>
                  <p className="mt-1 text-sm text-gray-700">
                    {reclamation.libelleCategorie} · Priorité {LIBELLE_PRIORITE[reclamation.priorite] ?? reclamation.priorite} · Ouverte le {formatDate(reclamation.dateCreation)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-700">Client</p>
                  <p className="font-medium text-gray-900">{reclamation.nomClient ?? '—'}</p>
                  <p className="mt-2 text-gray-700">Agent assigné</p>
                  <p className="font-medium text-gray-900">{reclamation.agentAssigneNom ?? 'Non assignée'}</p>
                </div>
              </div>

              {/* Actions agent */}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                <label htmlFor="statut" className="text-sm font-medium text-dark">Statut</label>
                <select
                  id="statut"
                  value={reclamation.statut}
                  disabled={action}
                  onChange={(e) => handleStatut(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-50"
                >
                  {STATUTS_AGENT.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <Button variant="ghost" className="w-auto" onClick={handleAssigner} disabled={action}>
                  <span className="flex items-center gap-2">
                    <UserPlus size={16} aria-hidden="true" />
                    M'assigner
                  </span>
                </Button>
              </div>
            </div>

            {/* Fil de messages */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4" role="list" aria-label="Fil de la réclamation">
                {reclamation.messages.map((msg, i) => (
                  <div
                    key={i}
                    role="listitem"
                    className={`flex flex-col gap-1 ${msg.auteur === 'AGENT' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {msg.auteur === 'AGENT' ? 'Réponse agent' : 'Message client'}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.auteur === 'AGENT' ? 'rounded-tr-sm bg-primary text-white' : 'rounded-tl-sm bg-gray-100 text-dark'
                      }`}
                    >
                      {msg.contenu}
                    </div>
                    <time dateTime={msg.date} className="text-xs text-gray-700">{formatDate(msg.date)}</time>
                  </div>
                ))}
              </div>

              {/* Reponse agent */}
              <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                <label htmlFor="reponse" className="sr-only">Répondre au client</label>
                <input
                  id="reponse"
                  type="text"
                  value={reponse}
                  onChange={(e) => setReponse(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRepondre() }}
                  placeholder="Répondre au client…"
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-dark placeholder-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                />
                <button
                  type="button"
                  onClick={handleRepondre}
                  disabled={!reponse.trim() || action}
                  aria-label="Envoyer la réponse"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </BackofficeLayout>
  )
}
