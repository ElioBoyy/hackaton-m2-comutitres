import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Eye, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { ApiError, changerStatutDossier, getDossierDetail, getDossierHistorique, validerPiece } from '~/lib/api'
import { agentMe } from '~/lib/agentAuth'
import { isAuthenticated, logout } from '~/lib/auth'
import { recupererContenu } from '~/lib/fichier'
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

/**
 * Meta des types d'action dans l'historique :
 * - color : classes Tailwind du badge (pastille texte)
 * - dot   : classes Tailwind du point sur la timeline (cercle plein)
 * - icon  : Component lucide affiche au centre du point pour les actions
 *           cles (validation/rejet). null = simple point colore.
 */
const TYPE_ACTION_LABELS: Record<string, {
  label: string
  color: string
  dot: string
  icon: typeof Check | null
}> = {
  changement_statut:               { label: 'Changement de statut',  color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   icon: null },
  depot_piece:                     { label: 'Dépôt de pièce',        color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400',   icon: null },
  validation_piece:                { label: 'Pièce validée',         color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  icon: Check },
  rejet_piece:                     { label: 'Pièce rejetée',         color: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    icon: X },
  paiement_enregistre:             { label: 'Paiement enregistré',   color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', icon: null },
  remboursement_traite:            { label: 'Remboursement traité',  color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: null },
  modification_information:        { label: 'Modification',          color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: null },
  commentaire_ajoute:              { label: 'Commentaire',           color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400',   icon: null },
  action_pour_compte_utilisateur:  { label: 'Action pour compte',    color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', icon: null },
  notification_envoyee:            { label: 'Notification envoyée',  color: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500',   icon: null },
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

/**
 * Modale plein ecran : visionneuse a gauche, panneau de validation a droite.
 *
 * <p>Viewer : recupere le contenu via GET /fichiers/contenu (proxy backend,
 * JWT agent ok) et rend inline application/pdf (<iframe>), image/* (<img>),
 * ou propose un download fallback. Blob URL revoque au demontage.
 *
 * <p>Panneau d'action : affiche le statut courant. Si en_attente, expose les
 * boutons Valider/Rejeter, avec un selecteur de motif inline si rejet (liste
 * predefinie + texte libre). Si deja validee/rejetee, lecture seule (le motif
 * est rappele pour les pieces rejetees). Une fois confirmee, onConfirm est
 * appelee et la modale se ferme cote parent.
 */
function ModalPieceExamen({
  piece,
  onConfirm,
  onClose,
  loading,
}: {
  piece: PieceJustificative
  onConfirm: (valider: boolean, motif?: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [contentType, setContentType] = useState<string>('')
  const [erreurViewer, setErreurViewer] = useState<string | null>(null)
  // Etape du panneau d'action : 'idle' = boutons V/R, 'rejet' = formulaire motif.
  const [etape, setEtape] = useState<'idle' | 'rejet'>('idle')
  const [motif, setMotif] = useState('')
  const [motifCustom, setMotifCustom] = useState('')

  const motifFinal = motif === 'autre' ? motifCustom : motif
  const traitee = piece.statutValidation !== 'en_attente'

  useEffect(() => {
    if (!piece.cheminFichier) {
      setErreurViewer('Cette pièce ne pointe vers aucun fichier.')
      return
    }
    let revokeUrl: string | null = null
    let cancelled = false
    recupererContenu(piece.cheminFichier)
      .then(({ url, contentType }) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        revokeUrl = url
        setBlobUrl(url)
        setContentType(contentType)
      })
      .catch(() => {
        if (!cancelled) setErreurViewer("Impossible d'ouvrir cette pièce.")
      })
    return () => {
      cancelled = true
      if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
  }, [piece.cheminFichier])

  const estPdf = contentType.startsWith('application/pdf')
  const estImage = contentType.startsWith('image/')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 text-white">
        <h2 className="font-heading text-sm font-semibold">{piece.libelleTypePiece}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la visionneuse"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Viewer */}
        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {erreurViewer ? (
            <p role="alert" className="text-sm text-red-300">{erreurViewer}</p>
          ) : !blobUrl ? (
            <p className="text-sm text-gray-300" aria-live="polite">Chargement…</p>
          ) : estPdf ? (
            <iframe
              src={blobUrl}
              title={piece.libelleTypePiece}
              className="h-full w-full rounded-lg bg-white"
            />
          ) : estImage ? (
            <img
              src={blobUrl}
              alt={piece.libelleTypePiece}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <a
              href={blobUrl}
              download
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              Télécharger ({contentType || 'fichier'})
            </a>
          )}
        </div>

        {/* Panneau d'action */}
        <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Statut</p>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_PIECE_STYLES[piece.statutValidation]}`}>
              {STATUT_PIECE_LABELS[piece.statutValidation]}
            </span>
            <p className="mt-3 text-xs text-gray-500">
              Déposé le {new Date(piece.dateDepot).toLocaleDateString('fr-FR')}
            </p>
            {piece.motifRejet && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                <strong>Motif de rejet :</strong> {piece.motifRejet}
              </p>
            )}
          </div>

          {traitee ? (
            <div className="p-4">
              <p className="text-xs text-gray-500">
                Cette pièce a déjà été traitée. Aucune action supplémentaire n'est disponible.
              </p>
            </div>
          ) : etape === 'idle' ? (
            <div className="flex flex-col gap-2 p-4">
              <button
                type="button"
                onClick={() => onConfirm(true)}
                disabled={loading}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40"
              >
                Valider la pièce
              </button>
              <button
                type="button"
                onClick={() => setEtape('rejet')}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                Rejeter la pièce
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Motif de rejet</p>
              <div className="space-y-2">
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
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Précisez le motif..."
                  rows={3}
                  value={motifCustom}
                  onChange={(e) => setMotifCustom(e.target.value)}
                />
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEtape('idle'); setMotif(''); setMotifCustom('') }}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => motifFinal && onConfirm(false, motifFinal)}
                  disabled={!motifFinal || loading}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

/**
 * Modale de confirmation generique (alternative a window.confirm). N'est
 * rendue que quand {@code open} est vrai. Boutons Annuler / Confirmer, le
 * style du bouton de confirmation depend de {@code kind} ('danger' = rouge,
 * 'primary' = vert). Bloque la fermeture pendant {@code loading}.
 */
function ModalConfirmation({
  open,
  title,
  message,
  confirmLabel,
  kind,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  kind: 'danger' | 'primary'
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  const confirmClass = kind === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-green-600 hover:bg-green-700'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 font-heading text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Boutons "Valider/Rejeter le dossier". Le bouton Valider est desactive tant
 * que toutes les pieces ne sont pas validees ; la modale de confirmation qui
 * suit le clic explique l'effet, donc pas de tooltip ici (cf. discussion).
 */
function DecisionsDossierActions({
  dossier,
  loading,
  onAction,
}: {
  dossier: DossierDetail
  loading: boolean
  onAction: (codeStatut: 'VALIDE' | 'REJETE') => void
}) {
  const validationBloquee = dossier.pieces.some((p) => p.statutValidation !== 'validee')
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onAction('REJETE')}
        disabled={loading}
        className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        Rejeter le dossier
      </button>
      <button
        type="button"
        onClick={() => onAction('VALIDE')}
        disabled={loading || validationBloquee}
        className="cursor-pointer rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        Valider le dossier
      </button>
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
  const [pieceExamen, setPieceExamen] = useState<PieceJustificative | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  // Statut cible quand l'agent vient de cliquer "Valider/Rejeter le dossier" :
  // ouvre la modale de confirmation. null = pas de demande en cours.
  const [confirmStatut, setConfirmStatut] = useState<'VALIDE' | 'REJETE' | null>(null)
  // Compteur monotone pour invalider les setState issus de fetchs obsoletes.
  // Toute reponse arrivant avec un id != currentRef.current est ignoree.
  const requestIdRef = useRef(0)

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
    if (!pieceExamen || agentId === null) return
    const reqId = ++requestIdRef.current
    setActionLoading(true)
    try {
      const updated = await validerPiece(id, pieceExamen.id, valider, motif)
      if (reqId !== requestIdRef.current) return
      setDossier((prev) =>
        prev
          ? { ...prev, pieces: prev.pieces.map((p) => (p.id === updated.id ? updated : p)) }
          : prev,
      )
      // Un rejet de piece peut auto-transitionner le dossier vers INCOMPLET
      // cote backend : on rafraichit le detail pour reprendre le statut a jour.
      if (!valider) {
        getDossierDetail(id)
          .then((detail) => { if (reqId === requestIdRef.current) setDossier(detail) })
          .catch(() => {})
      }
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
    } finally {
      if (reqId === requestIdRef.current) {
        setActionLoading(false)
        setPieceExamen(null)
      }
    }
  }

  /** Ouvre la modale de confirmation. La requete HTTP n'est lancee qu'au confirm. */
  function demanderChangementStatutDossier(codeStatut: 'VALIDE' | 'REJETE') {
    if (agentId === null) return
    setConfirmStatut(codeStatut)
  }

  async function confirmerChangementStatutDossier() {
    if (!confirmStatut || agentId === null) return
    const reqId = ++requestIdRef.current
    const cible = confirmStatut
    setActionLoading(true)
    try {
      const updated = await changerStatutDossier(id, cible)
      if (reqId !== requestIdRef.current) return
      setDossier(updated)
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
    } finally {
      if (reqId === requestIdRef.current) {
        setActionLoading(false)
        setConfirmStatut(null)
      }
    }
  }

  if (!agentName) return null

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      {pieceExamen && (
        <ModalPieceExamen
          piece={pieceExamen}
          loading={actionLoading}
          onConfirm={handleValidation}
          onClose={() => setPieceExamen(null)}
        />
      )}

      <ModalConfirmation
        open={confirmStatut !== null}
        loading={actionLoading}
        title={confirmStatut === 'VALIDE' ? 'Valider le dossier ?' : 'Rejeter le dossier ?'}
        message={confirmStatut === 'VALIDE'
          ? 'Le dossier passera en statut « Validé ».'
          : 'Le dossier passera en statut « Rejeté ». Cette action est irréversible.'}
        confirmLabel={confirmStatut === 'VALIDE' ? 'Confirmer la validation' : 'Confirmer le rejet'}
        kind={confirmStatut === 'VALIDE' ? 'primary' : 'danger'}
        onConfirm={() => void confirmerChangementStatutDossier()}
        onCancel={() => setConfirmStatut(null)}
      />

      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* En-tête : titre/badge à gauche, actions globales à droite */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          {/* Actions globales sur le dossier (haut a droite). Visibles tant que
              le dossier est instructible (EN_VERIFICATION / INCOMPLET) et qu'il
              y a au moins une piece. */}
          {dossier
            && (dossier.statut.code === 'EN_VERIFICATION' || dossier.statut.code === 'INCOMPLET')
            && dossier.pieces.length > 0 && (
              <DecisionsDossierActions
                dossier={dossier}
                loading={actionLoading}
                onAction={demanderChangementStatutDossier}
              />
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
                        type="button"
                        onClick={() => setPieceExamen(piece)}
                        aria-label={`Examiner ${piece.libelleTypePiece}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <Eye size={14} aria-hidden="true" />
                        Examiner
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
            <ol>
              {historique.map((entree, index, arr) => {
                const meta = TYPE_ACTION_LABELS[entree.typeAction] ?? {
                  label: entree.typeAction,
                  color: 'bg-gray-100 text-gray-700',
                  dot: 'bg-gray-400',
                  icon: null,
                }
                const Icone = meta.icon
                const isLast = index === arr.length - 1
                return (
                  // Layout en flex : col gauche (dot + trait), col droite (contenu).
                  // Le pb-6 cree l'espace vertical entre items ET sert de zone ou la
                  // ligne du connecteur peut s'etendre jusqu'au prochain dot.
                  <li key={entree.id} className={`relative flex gap-3 ${isLast ? '' : 'pb-6'}`}>
                    {/* Connecteur : du bas du dot (top-5 = 20px) jusqu'au bas de la
                        li (bottom-0 = jusqu'au prochain dot). w-0.5 = 2px, centre
                        sur left-[9px] (le dot fait 20px, donc son centre est a 10px). */}
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[9px] top-5 w-0.5 bg-gray-300"
                      />
                    )}
                    {/* Dot. shrink-0 empeche flex de le compresser. z-10 garantit
                        qu'il passe par-dessus le connecteur d'un item precedent en
                        cas de chevauchement visuel. */}
                    <span
                      aria-hidden="true"
                      className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${meta.dot}`}
                    >
                      {Icone && <Icone size={12} strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
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
                    </div>
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
