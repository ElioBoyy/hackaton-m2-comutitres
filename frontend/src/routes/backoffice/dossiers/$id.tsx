import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Check, Eye, Plus, RefreshCw, Sparkles, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { activerDossier, ajouterPiece, ApiError, changerStatutDossier, getDossierDetail, getDossierHistorique, remplacerFichierPiece, validerPiece } from '~/lib/api'
import { agentMe } from '~/lib/agentAuth'
import { isAuthenticated, logout } from '~/lib/auth'
import { recupererContenu } from '~/lib/fichier'
import { m } from '~/paraglide/messages'
import type { DossierDetail, HistoriqueEntree, PieceJustificative } from '~/lib/types/dossier'

export const Route = createFileRoute('/backoffice/dossiers/$id')({
  component: DossierDetailPage,
})

const motifsRejet = () => [
  m.bo_dossier_reject_reason_illegible(),
  m.bo_dossier_reject_reason_expired(),
  m.bo_dossier_reject_reason_wrong(),
  m.bo_dossier_reject_reason_truncated(),
  m.bo_dossier_reject_reason_name_mismatch(),
]

/**
 * Meta des types d'action dans l'historique :
 * - color : classes Tailwind du badge (pastille texte)
 * - dot   : classes Tailwind du point sur la timeline (cercle plein)
 * - icon  : Component lucide affiche au centre du point pour les actions
 *           cles (validation/rejet). null = simple point colore.
 */
type TypeActionMeta = {
  label: string
  color: string
  dot: string
  icon: typeof Check | null
}

const typeActionLabels = (): Record<string, TypeActionMeta> => ({
  changement_statut:               { label: m.bo_dossier_action_status_change(),    color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   icon: null },
  depot_piece:                     { label: m.bo_dossier_action_depot_piece(),      color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400',   icon: null },
  validation_piece:                { label: m.bo_dossier_action_piece_validee(),    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  icon: Check },
  rejet_piece:                     { label: m.bo_dossier_action_piece_rejetee(),    color: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    icon: X },
  paiement_enregistre:             { label: m.bo_dossier_action_paiement(),         color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', icon: null },
  remboursement_traite:            { label: m.bo_dossier_action_remboursement(),    color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: null },
  modification_information:        { label: m.bo_dossier_action_modification(),     color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', icon: null },
  commentaire_ajoute:              { label: m.bo_dossier_action_commentaire(),      color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400',   icon: null },
  action_pour_compte_utilisateur:  { label: m.bo_dossier_action_pour_compte(),      color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', icon: null },
  notification_envoyee:            { label: m.bo_dossier_action_notification(),     color: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500',   icon: null },
})

const STATUT_PIECE_STYLES: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  validee: 'bg-green-100 text-green-700',
  rejetee: 'bg-red-100 text-red-700',
}

const statutPieceLabels = (): Record<string, string> => ({
  en_attente: m.bo_dossier_piece_status_en_attente(),
  validee: m.bo_dossier_piece_status_validee(),
  rejetee: m.bo_dossier_piece_status_rejetee(),
})

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
      setErreurViewer(m.bo_dossier_modal_no_file_path())
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
        if (!cancelled) setErreurViewer(m.bo_dossier_modal_cannot_open())
      })
    return () => {
      cancelled = true
      if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
  }, [piece.cheminFichier])

  const estPdf = contentType.startsWith('application/pdf')
  const estImage = contentType.startsWith('image/')

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-black/80">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 text-white">
        <h2 className="font-heading text-sm font-semibold">{piece.libelleTypePiece}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={m.bo_dossier_modal_close_viewer()}
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
            <p className="text-sm text-gray-300" aria-live="polite">{m.common_loading_short()}</p>
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
              {contentType ? m.bo_dossier_modal_download({ type: contentType }) : m.bo_dossier_modal_download_fallback()}
            </a>
          )}
        </div>

        {/* Panneau d'action */}
        <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">{m.bo_dossier_modal_status_label()}</p>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_PIECE_STYLES[piece.statutValidation]}`}>
              {statutPieceLabels()[piece.statutValidation]}
            </span>
            <p className="mt-3 text-xs text-gray-500">
              {m.bo_dossier_submitted_on()} {new Date(piece.dateDepot).toLocaleDateString('fr-FR')}
            </p>
            {piece.motifRejet && (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                <strong>{m.bo_dossier_modal_motif_rejet_label()}</strong> {piece.motifRejet}
              </p>
            )}
          </div>

          {traitee ? (
            <div className="p-4">
              <p className="text-xs text-gray-500">
                {m.bo_dossier_modal_already_processed()}
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
                {m.bo_dossier_modal_validate_button()}
              </button>
              <button
                type="button"
                onClick={() => setEtape('rejet')}
                disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {m.bo_dossier_modal_reject_button()}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{m.bo_dossier_modal_motif_rejet_title()}</p>
              <div className="space-y-2">
                {motifsRejet().map((mot) => (
                  <label key={mot} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="motif"
                      value={mot}
                      checked={motif === mot}
                      onChange={() => setMotif(mot)}
                      className="accent-red-600"
                    />
                    {mot}
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
                  {m.bo_dossier_reject_reason_other()}
                </label>
              </div>
              {motif === 'autre' && (
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder={m.bo_dossier_modal_specify_reason_placeholder()}
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
                  {m.common_cancel()}
                </button>
                <button
                  type="button"
                  onClick={() => motifFinal && onConfirm(false, motifFinal)}
                  disabled={!motifFinal || loading}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
                >
                  {m.common_confirm()}
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
            {m.common_cancel()}
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
/**
 * Modale d'activation d'un dossier VALIDE. L'agent choisit la date de debut
 * des droits (defaut = aujourd'hui). La date de fin est calculee cote backend
 * selon la periodicite du type d'abonnement et n'apparait que pour info.
 */
function ModalActiverAbonnement({
  open,
  dossier,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean
  dossier: DossierDetail | null
  loading: boolean
  onClose: () => void
  onSubmit: (dateDebutDroits: string) => Promise<boolean>
}) {
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const [dateDebut, setDateDebut] = useState(aujourdHui)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setDateDebut(aujourdHui)
      setSubmitting(false)
    }
    // aujourdHui change a chaque render mais on n'en a pas besoin comme dep -
    // on veut juste reset a chaque ouverture/fermeture de la modale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open || !dossier) return null

  async function handleSubmit() {
    if (!dateDebut) return
    setSubmitting(true)
    const ok = await onSubmit(dateDebut)
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 font-heading text-lg font-semibold text-gray-900">
          {m.bo_dossier_modal_activate_title()}
        </h2>
        <p className="mb-5 text-sm text-gray-600">
          {m.bo_dossier_modal_activate_description()} ({dossier.typeAbonnement.libelle}).
        </p>

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          {m.bo_dossier_modal_rights_start_label()}
        </label>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="mb-5 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || loading}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            {m.common_cancel()}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!dateDebut || submitting || loading}
            className="flex-1 cursor-pointer rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? m.bo_dossier_modal_activating() : m.bo_dossier_modal_activate_short()}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Boutons globaux du header. Le set change selon le statut du dossier :
 *  - EN_VERIFICATION / INCOMPLET → "Rejeter le dossier"
 *    (la validation se fait pièce par pièce ; le dossier auto-passe à VALIDE
 *     quand toutes les pièces sont validées).
 *  - VALIDE → "Activer l'abonnement" (ouvre la modale date).
 *  - autres statuts → rien (lecture seule).
 */
function DecisionsDossierActions({
  dossier,
  loading,
  onRejeter,
  onActiver,
}: {
  dossier: DossierDetail
  loading: boolean
  onRejeter: () => void
  onActiver: () => void
}) {
  const codeStatut = dossier.statut.code
  if (codeStatut === 'VALIDE') {
    return (
      <button
        type="button"
        onClick={onActiver}
        disabled={loading}
        className="cursor-pointer rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {m.bo_dossier_action_activate_subscription()}
      </button>
    )
  }
  if (codeStatut === 'EN_VERIFICATION' || codeStatut === 'INCOMPLET') {
    return (
      <button
        type="button"
        onClick={onRejeter}
        disabled={loading}
        className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {m.bo_dossier_action_reject_dossier()}
      </button>
    )
  }
  return null
}

/**
 * Bouton "Remplacer" pour une pièce. Cache un input[type=file] et le declenche
 * au clic sur le bouton visible. Au choix d'un fichier, appelle onUpload.
 */
function BoutonRemplacerPiece({
  piece,
  loading,
  onUpload,
}: {
  piece: PieceJustificative
  loading: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          if (inputRef.current) inputRef.current.value = '' // reset pour re-uploader le meme fichier
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        aria-label={m.bo_dossier_replace_aria({ label: piece.libelleTypePiece })}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
        {loading ? m.common_send() : m.bo_dossier_replace_button()}
      </button>
    </>
  )
}

/**
 * Modale d'ajout d'une pièce sur un dossier. Le sélecteur de types est filtré
 * aux types attendus pour le type d'abonnement du dossier (cf. piecesRequises),
 * en excluant ceux deja deposes pour eviter le 409 cote backend.
 */
function ModalAjouterPiece({
  open,
  dossier,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean
  dossier: DossierDetail | null
  loading: boolean
  onClose: () => void
  onSubmit: (codeTypePiece: string, file: File) => Promise<boolean>
}) {
  const [codeTypePiece, setCodeTypePiece] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setCodeTypePiece('')
      setFile(null)
      setSubmitting(false)
    }
  }, [open])

  if (!open || !dossier) return null

  // Types deposes : on mappe par libelle (le DTO PieceJustificative n'expose
  // pas le code), donc on exclut les requises dont le libelle match une piece.
  const libellesDeposes = new Set(dossier.pieces.map((p) => p.libelleTypePiece))
  const optionsDisponibles = dossier.piecesRequises.filter(
    (r) => !libellesDeposes.has(r.libelleTypePiece),
  )

  async function handleSubmit() {
    if (!codeTypePiece || !file) return
    setSubmitting(true)
    const ok = await onSubmit(codeTypePiece, file)
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 font-heading text-lg font-semibold text-gray-900">{m.bo_dossier_modal_add_title()}</h2>
        <p className="mb-5 text-sm text-gray-500">
          {m.bo_dossier_modal_add_description()}
        </p>

        {optionsDisponibles.length === 0 ? (
          <p className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            {m.bo_dossier_modal_all_uploaded()}
          </p>
        ) : (
          <>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
              {m.bo_dossier_modal_doc_type_label()}
            </label>
            <select
              value={codeTypePiece}
              onChange={(e) => setCodeTypePiece(e.target.value)}
              className="mb-4 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{m.common_select_placeholder()}</option>
              {optionsDisponibles.map((r) => (
                <option key={r.codeTypePiece} value={r.codeTypePiece}>
                  {r.libelleTypePiece}
                  {r.obligatoire ? '' : m.dossier_piece_optional_suffix()}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
              {m.bo_dossier_modal_add_file_label()}
            </label>
            <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-3 transition hover:border-primary-light">
              <Upload size={18} className="shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1 truncate text-sm text-gray-700">
                {file ? file.name : m.common_choose_file()}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || loading}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            {m.common_cancel()}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!codeTypePiece || !file || submitting || loading}
            className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-focus disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? m.common_send() : m.bo_dossier_modal_add_submit()}
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
  const [pieceExamen, setPieceExamen] = useState<PieceJustificative | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  // Id de la piece en cours de remplacement (pour disabled + spinner sur ce
  // seul bouton "Remplacer"). null = pas d'upload en cours.
  const [remplacementPieceId, setRemplacementPieceId] = useState<number | null>(null)
  // true = modale d'ajout de piece ouverte.
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  // true = modale "Confirmer le rejet" ouverte.
  const [confirmRejet, setConfirmRejet] = useState(false)
  // true = modale "Activer l'abonnement" ouverte (date picker).
  const [activationOuverte, setActivationOuverte] = useState(false)
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
      // Auto-transition cote backend possible : INCOMPLET (rejet) ou VALIDE (toutes
      // pieces validees). On refetch systematiquement le detail pour synchroniser.
      getDossierDetail(id)
        .then((detail) => { if (reqId === requestIdRef.current) setDossier(detail) })
        .catch(() => {})
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

  async function confirmerRejet() {
    if (agentId === null) return
    const reqId = ++requestIdRef.current
    setActionLoading(true)
    try {
      const updated = await changerStatutDossier(id, 'REJETE')
      if (reqId !== requestIdRef.current) return
      setDossier(updated)
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
    } finally {
      if (reqId === requestIdRef.current) {
        setActionLoading(false)
        setConfirmRejet(false)
      }
    }
  }

  async function confirmerActivation(dateDebutDroits: string): Promise<boolean> {
    if (agentId === null) return false
    const reqId = ++requestIdRef.current
    setActionLoading(true)
    try {
      const updated = await activerDossier(id, dateDebutDroits)
      if (reqId !== requestIdRef.current) return true
      setDossier(updated)
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert(m.bo_dossier_activate_status_error())
      } else {
        window.alert(m.bo_dossier_activate_failed())
      }
      return false
    } finally {
      if (reqId === requestIdRef.current) setActionLoading(false)
    }
  }

  async function handleRemplacementFichier(piece: PieceJustificative, file: File) {
    if (agentId === null) return
    const reqId = ++requestIdRef.current
    setRemplacementPieceId(piece.id)
    try {
      const updated = await remplacerFichierPiece(id, piece.id, file)
      if (reqId !== requestIdRef.current) return
      setDossier((prev) =>
        prev
          ? { ...prev, pieces: prev.pieces.map((p) => (p.id === updated.id ? updated : p)) }
          : prev,
      )
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert(m.bo_dossier_piece_not_modifiable())
      } else {
        window.alert(m.bo_dossier_upload_failed())
      }
    } finally {
      if (reqId === requestIdRef.current) setRemplacementPieceId(null)
    }
  }

  async function handleAjouterPiece(codeTypePiece: string, file: File): Promise<boolean> {
    if (agentId === null) return false
    const reqId = ++requestIdRef.current
    try {
      const piece = await ajouterPiece(id, file, codeTypePiece)
      if (reqId !== requestIdRef.current) return false
      // Refetch full detail : ajout d'une piece peut faire varier piecesRequises
      // restantes (et avoir cree un nouvel objet à afficher en haut de la liste).
      getDossierDetail(id)
        .then((detail) => { if (reqId === requestIdRef.current) setDossier(detail) })
        .catch(() => {})
      getDossierHistorique(id)
        .then((res) => { if (reqId === requestIdRef.current) setHistorique(res.historique) })
        .catch(() => {})
      // Patch optimiste en attendant le refetch.
      setDossier((prev) => prev ? { ...prev, pieces: [piece, ...prev.pieces] } : prev)
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert(m.bo_dossier_piece_exists_use_replace())
      } else {
        window.alert(m.bo_dossier_upload_failed())
      }
      return false
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

      <ModalAjouterPiece
        open={ajoutOuvert}
        dossier={dossier}
        loading={actionLoading}
        onClose={() => setAjoutOuvert(false)}
        onSubmit={handleAjouterPiece}
      />

      <ModalConfirmation
        open={confirmRejet}
        loading={actionLoading}
        title={m.bo_dossier_confirm_reject_title()}
        message={m.bo_dossier_confirm_reject_message()}
        confirmLabel={m.bo_dossier_confirm_reject_button()}
        kind="danger"
        onConfirm={() => void confirmerRejet()}
        onCancel={() => setConfirmRejet(false)}
      />

      <ModalActiverAbonnement
        open={activationOuverte}
        dossier={dossier}
        loading={actionLoading}
        onClose={() => setActivationOuverte(false)}
        onSubmit={confirmerActivation}
      />

      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* En-tête : titre/badge à gauche, actions globales à droite */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/backoffice/dashboard' })}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              {m.bo_dossier_back()}
            </button>
            <h1 className="font-heading text-xl font-semibold text-gray-900">
              {dossier ? dossier.numeroDossier : `Dossier #${id}`}
            </h1>
            {dossier && (
              <StatusBadge libelle={dossier.statut.libelle} categorie={dossier.statut.categorie} />
            )}
          </div>

          {/* Actions globales sur le dossier (haut a droite). Le composant
              decide quel(s) bouton(s) afficher selon le statut. */}
          {dossier && (
            <DecisionsDossierActions
              dossier={dossier}
              loading={actionLoading}
              onRejeter={() => setConfirmRejet(true)}
              onActiver={() => setActivationOuverte(true)}
            />
          )}
        </div>

        {loadingDetail && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            {m.common_loading_short()}
          </div>
        )}

        {dossier && (
          <>
            {/* Informations dossier */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-heading text-base font-semibold text-gray-800">
                {m.bo_dossier_section_info()}
              </h2>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">{m.bo_dossier_info_subscription()}</dt>
                  <dd className="font-medium text-gray-900">{dossier.typeAbonnement.libelle}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{m.bo_dossier_info_amount()}</dt>
                  <dd className="font-medium text-gray-900">
                    {dossier.montantTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">{m.bo_dossier_info_creation_date()}</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
                {dossier.dateDebutDroits && (
                  <div>
                    <dt className="text-gray-500">{m.bo_dossier_info_rights_start()}</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(dossier.dateDebutDroits).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                )}
                {dossier.dateFinDroits && (
                  <div>
                    <dt className="text-gray-500">{m.bo_dossier_info_rights_end()}</dt>
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
                { label: m.bo_dossier_info_holder(), personne: dossier.titulaire },
                { label: m.bo_dossier_info_payer(), personne: dossier.payeur },
              ].map(({ label, personne }) => (
                <section key={label} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="mb-3 font-heading text-base font-semibold text-gray-800">{label}</h2>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">{m.bo_dossier_info_name()}</dt>
                      <dd className="font-medium text-gray-900">
                        {personne.prenom} {personne.nom}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">{m.bo_dossier_info_email()}</dt>
                      <dd className="font-medium text-gray-900">{personne.email}</dd>
                    </div>
                  </dl>
                </section>
              ))}
            </div>

            {/* Pièces justificatives */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-heading text-base font-semibold text-gray-800">
                  {m.bo_dossier_section_pieces()}
                </h2>
                {(dossier.statut.code === 'EN_VERIFICATION' || dossier.statut.code === 'INCOMPLET') && (() => {
                  // Toutes les pieces attendues deja deposees -> rien a ajouter.
                  const libellesDeposes = new Set(dossier.pieces.map((p) => p.libelleTypePiece))
                  const toutesDeposees = dossier.piecesRequises.length > 0
                    && dossier.piecesRequises.every((r) => libellesDeposes.has(r.libelleTypePiece))
                  return (
                    <button
                      type="button"
                      onClick={() => setAjoutOuvert(true)}
                      disabled={actionLoading || toutesDeposees}
                      title={toutesDeposees ? m.bo_dossier_all_uploaded_tooltip() : undefined}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={14} aria-hidden="true" />
                      {m.bo_dossier_add_piece_button()}
                    </button>
                  )
                })()}
              </div>
              {dossier.pieces.length === 0 ? (
                <p className="text-sm text-gray-400">{m.bo_dossier_no_pieces()}</p>
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
                          {statutPieceLabels()[piece.statutValidation]}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{piece.libelleTypePiece}</p>
                            {piece.verifieParIA && piece.statutValidation !== 'rejetee' && (
                              <span
                                title={m.pieces_ia_verified_tooltip()}
                                className="inline-flex items-center gap-1 rounded-full bg-secondary-light/20 px-2 py-0.5 text-xs font-medium text-secondary"
                              >
                                <Sparkles size={12} aria-hidden="true" />
                                {m.pieces_ia_verified_badge()}
                              </span>
                            )}
                          </div>
                          {piece.motifRejet && (
                            <p className="text-xs text-red-600">{m.bo_dossier_motif_label()} {piece.motifRejet}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {m.bo_dossier_submitted_on()} {new Date(piece.dateDepot).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(dossier.statut.code === 'EN_VERIFICATION' || dossier.statut.code === 'INCOMPLET') && (
                          <BoutonRemplacerPiece
                            piece={piece}
                            loading={remplacementPieceId === piece.id}
                            onUpload={(file) => void handleRemplacementFichier(piece, file)}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setPieceExamen(piece)}
                          aria-label={m.bo_dossier_examine_aria({ label: piece.libelleTypePiece })}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={14} aria-hidden="true" />
                          {m.bo_dossier_examine_button()}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

          </>
        )}

        {/* Historique */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-heading text-base font-semibold text-gray-800">{m.bo_dossier_section_history()}</h2>
          {loadingHistorique && (
            <p className="text-sm text-gray-400">{m.bo_dossier_history_loading()}</p>
          )}
          {!loadingHistorique && historique?.length === 0 && (
            <p className="text-sm text-gray-400">{m.bo_dossier_no_history()}</p>
          )}
          {!loadingHistorique && historique && historique.length > 0 && (
            <ol>
              {historique.map((entree, index, arr) => {
                const meta = typeActionLabels()[entree.typeAction] ?? {
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
