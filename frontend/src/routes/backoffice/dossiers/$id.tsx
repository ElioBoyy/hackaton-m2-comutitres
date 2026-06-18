import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { ApiError, getDossierDetail, getDossierHistorique, validerPiece } from '~/lib/api'
import { agentMe } from '~/lib/agentAuth'
import { isAuthenticated, logout } from '~/lib/auth'
import type { DossierDetail, HistoriqueEntree, PieceJustificative } from '~/lib/types/dossier'

export const Route = createFileRoute('/backoffice/dossiers/$id')({
  component: DossierDetailPage,
})

const MOTIFS_REJET = [
  'Document illisible',
  'Document expiré',
  'Mauvais document fourni',
  'Document tronqué ou incomplet',
  'Nom ne correspond pas au dossier',
]

const TYPE_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  changement_statut: { label: 'Changement de statut', color: 'bg-blue-100 text-blue-700' },
  depot_piece: { label: 'Dépôt de pièce', color: 'bg-gray-100 text-gray-700' },
  validation_piece: { label: 'Pièce validée', color: 'bg-green-100 text-green-700' },
  rejet_piece: { label: 'Pièce rejetée', color: 'bg-red-100 text-red-700' },
  paiement_enregistre: { label: 'Paiement enregistré', color: 'bg-purple-100 text-purple-700' },
  remboursement_traite: { label: 'Remboursement traité', color: 'bg-orange-100 text-orange-700' },
  modification_information: { label: 'Modification', color: 'bg-yellow-100 text-yellow-700' },
  commentaire_ajoute: { label: 'Commentaire', color: 'bg-gray-100 text-gray-700' },
  action_pour_compte_utilisateur: { label: 'Action pour compte', color: 'bg-indigo-100 text-indigo-700' },
  notification_envoyee: { label: 'Notification envoyée', color: 'bg-teal-100 text-teal-700' },
}

const STATUT_PIECE_STYLES: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  validee: 'bg-green-100 text-green-700',
  rejetee: 'bg-red-100 text-red-700',
}

const STATUT_PIECE_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  validee: 'Validée',
  rejetee: 'Rejetée',
}

function ModalValidation({
  piece,
  onConfirm,
  onClose,
}: {
  piece: PieceJustificative
  onConfirm: (valider: boolean, motif?: string) => void
  onClose: () => void
}) {
  const [action, setAction] = useState<'valider' | 'rejeter' | null>(null)
  const [motif, setMotif] = useState('')
  const [motifCustom, setMotifCustom] = useState('')

  const motifFinal = motif === 'autre' ? motifCustom : motif

  if (action === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-1 font-heading text-lg font-semibold text-gray-900">
            {piece.libelleTypePiece}
          </h2>
          <p className="mb-6 text-sm text-gray-500">Que souhaitez-vous faire avec cette pièce ?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setAction('valider')}
              className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Valider
            </button>
            <button
              onClick={() => setAction('rejeter')}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Rejeter
            </button>
          </div>
          <button onClick={onClose} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600">
            Annuler
          </button>
        </div>
      </div>
    )
  }

  if (action === 'valider') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-2 font-heading text-lg font-semibold text-gray-900">Confirmer la validation</h2>
          <p className="mb-6 text-sm text-gray-600">
            Voulez-vous valider la pièce <strong>{piece.libelleTypePiece}</strong> ?
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button
              onClick={() => onConfirm(true)}
              className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Confirmer la validation
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 font-heading text-lg font-semibold text-gray-900">Motif de rejet</h2>
        <p className="mb-4 text-sm text-gray-600">
          Sélectionnez ou saisissez le motif de rejet pour <strong>{piece.libelleTypePiece}</strong>.
        </p>
        <div className="mb-3 space-y-2">
          {MOTIFS_REJET.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="motif"
                value={m}
                checked={motif === m}
                onChange={() => setMotif(m)}
                className="accent-red-600"
              />
              {m}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="motif"
              value="autre"
              checked={motif === 'autre'}
              onChange={() => setMotif('autre')}
              className="accent-red-600"
            />
            Autre
          </label>
        </div>
        {motif === 'autre' && (
          <textarea
            className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Précisez le motif..."
            rows={3}
            value={motifCustom}
            onChange={(e) => setMotifCustom(e.target.value)}
          />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={() => motifFinal && onConfirm(false, motifFinal)}
            disabled={!motifFinal}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
          >
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  )
}

function DossierDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [agentName, setAgentName] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<number | null>(null)
  const [dossier, setDossier] = useState<DossierDetail | null>(null)
  const [historique, setHistorique] = useState<HistoriqueEntree[] | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingHistorique, setLoadingHistorique] = useState(true)
  const [pieceEnCours, setPieceEnCours] = useState<PieceJustificative | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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
      .then((agent) => {
        setAgentName(`${agent.prenom} ${agent.nom}`)
        setAgentId(agent.id)
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          handleUnauthorized()
        }
      })
    getDossierDetail(id)
      .then(setDossier)
      .catch(() => {})
      .finally(() => setLoadingDetail(false))
    getDossierHistorique(id)
      .then((res) => setHistorique(res.historique))
      .catch(() => {})
      .finally(() => setLoadingHistorique(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleValidation(valider: boolean, motif?: string) {
    if (!pieceEnCours || agentId === null) return
    setActionLoading(true)
    try {
      const updated = await validerPiece(id, pieceEnCours.id, valider, motif)
      setDossier((prev) =>
        prev
          ? { ...prev, pieces: prev.pieces.map((p) => (p.id === updated.id ? updated : p)) }
          : prev,
      )
      getDossierHistorique(id)
        .then((res) => setHistorique(res.historique))
        .catch(() => {})
    } finally {
      setActionLoading(false)
      setPieceEnCours(null)
    }
  }

  if (!agentName) return null

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      {pieceEnCours && !actionLoading && (
        <ModalValidation
          piece={pieceEnCours}
          onConfirm={handleValidation}
          onClose={() => setPieceEnCours(null)}
        />
      )}

      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/backoffice/dashboard' })}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Retour
          </button>
          <h1 className="font-heading text-xl font-semibold text-gray-900">
            {dossier ? dossier.numeroDossier : `Dossier #${id}`}
          </h1>
          {dossier && (
            <StatusBadge libelle={dossier.statut.libelle} categorie={dossier.statut.categorie} />
          )}
        </div>

        {loadingDetail && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            Chargement…
          </div>
        )}

        {dossier && (
          <>
            {/* Informations dossier */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-heading text-base font-semibold text-gray-800">
                Informations du dossier
              </h2>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Abonnement</dt>
                  <dd className="font-medium text-gray-900">{dossier.typeAbonnement.libelle}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Montant</dt>
                  <dd className="font-medium text-gray-900">
                    {dossier.montantTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date de création</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
                {dossier.dateDebutDroits && (
                  <div>
                    <dt className="text-gray-500">Début des droits</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(dossier.dateDebutDroits).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                )}
                {dossier.dateFinDroits && (
                  <div>
                    <dt className="text-gray-500">Fin des droits</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(dossier.dateFinDroits).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Porteur + Payeur */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Porteur du dossier', personne: dossier.titulaire },
                { label: 'Payeur', personne: dossier.payeur },
              ].map(({ label, personne }) => (
                <section key={label} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="mb-3 font-heading text-base font-semibold text-gray-800">{label}</h2>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Nom</dt>
                      <dd className="font-medium text-gray-900">
                        {personne.prenom} {personne.nom}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Email</dt>
                      <dd className="font-medium text-gray-900">{personne.email}</dd>
                    </div>
                  </dl>
                </section>
              ))}
            </div>

            {/* Pièces justificatives */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-heading text-base font-semibold text-gray-800">
                Pièces justificatives
              </h2>
              {dossier.pieces.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune pièce déposée.</p>
              ) : (
                <ul className="space-y-3">
                  {dossier.pieces.map((piece) => (
                    <li
                      key={piece.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_PIECE_STYLES[piece.statutValidation]}`}
                        >
                          {STATUT_PIECE_LABELS[piece.statutValidation]}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{piece.libelleTypePiece}</p>
                          {piece.motifRejet && (
                            <p className="text-xs text-red-600">Motif : {piece.motifRejet}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Déposé le {new Date(piece.dateDepot).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPieceEnCours(piece)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Traiter
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* Historique */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-heading text-base font-semibold text-gray-800">Historique</h2>
          {loadingHistorique && (
            <p className="text-sm text-gray-400">Chargement de l'historique…</p>
          )}
          {!loadingHistorique && historique?.length === 0 && (
            <p className="text-sm text-gray-400">Aucune entrée dans l'historique.</p>
          )}
          {!loadingHistorique && historique && historique.length > 0 && (
            <ol className="relative border-l border-gray-200 pl-6 space-y-5">
              {historique.map((entree) => {
                const meta = TYPE_ACTION_LABELS[entree.typeAction] ?? {
                  label: entree.typeAction,
                  color: 'bg-gray-100 text-gray-700',
                }
                return (
                  <li key={entree.id} className="relative">
                    <span className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      {entree.statutAvant && entree.statutApres && (
                        <span className="text-xs text-gray-500">
                          {entree.statutAvant} → {entree.statutApres}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(entree.dateAction).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-gray-500">par {entree.nomAuteur}</span>
                    </div>
                    {entree.description && (
                      <p className="mt-1 text-sm text-gray-600">{entree.description}</p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </BackofficeLayout>
  )
}
