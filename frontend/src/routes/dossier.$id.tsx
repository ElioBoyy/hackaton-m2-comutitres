import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  FileText,
  Loader2,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { ajouterPiece, ApiError, remplacerFichierPiece } from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import {
  fetchDossierDetail,
  resilierDossier,
  soumettreEnVerification,
  enregistrerPieces,
  supprimerDossier,
  type DossierDetail,
  type PieceJustificative,
} from '~/lib/dossier'
import { deposerFichier, type TypePiece } from '~/lib/fichier'
import { DashboardLayout } from '~/components/DashboardLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { TableauPieces } from '~/components/TableauPieces'
import type { StatutCategorie } from '~/lib/types/dossier'

export const Route = createFileRoute('/dossier/$id')({
  component: DossierDetailPage,
})

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, mo, d] = iso.split('T')[0].split('-')
  return `${d}/${mo}/${y}`
}

function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function categorieFromCode(code: string): StatutCategorie {
  if (['ACTIF', 'VALIDE'].includes(code)) return 'abouti'
  if (['RESILIE', 'REJETE', 'EXPIRE'].includes(code)) return 'clos'
  if (code === 'INCOMPLET') return 'rejete'
  return 'en_cours'
}

/* ─── ChampFichier ─────────────────────────────────────────────────────── */

interface PieceUploaded { nom: string; cle: string }

function ChampFichier({
  label,
  typePiece,
  valeur,
  idDossier,
  onSaved,
}: {
  label: string
  typePiece: TypePiece
  valeur: PieceUploaded | null
  idDossier: number
  onSaved: (p: PieceUploaded) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const inputId = `piece-${typePiece}`

  async function handleFile(f: File) {
    setUploading(true)
    setErreur(null)
    try {
      const rep = await deposerFichier(f, typePiece)
      // Persist immédiatement en base
      await enregistrerPieces(idDossier, [{ codeTypePiece: typePiece, cheminFichier: rep.cle }])
      onSaved({ nom: f.name, cle: rep.cle })
    } catch {
      setErreur('Erreur lors de l\'envoi, réessayez.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors ${
          uploading ? 'border-primary/40 bg-blue-pale/30' : valeur ? 'border-success/50 bg-success/5' : 'border-gray-300 hover:border-primary'
        }`}
      >
        {uploading
          ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          : valeur
          ? <BadgeCheck className="h-5 w-5 shrink-0 text-success" />
          : <FileText className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark">{label}</p>
          <p className="truncate text-xs text-gray-500">
            {uploading ? 'Envoi en cours…' : valeur ? valeur.nom : 'Aucun fichier sélectionné'}
          </p>
        </div>
        {!uploading && (
          <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            valeur ? 'bg-success/10 text-success' : 'bg-blue-pale text-primary'
          }`}>
            {valeur ? 'Modifier' : 'Choisir'}
          </span>
        )}
        <input
          id={inputId}
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
        />
      </label>
      {erreur && <p className="mt-1 text-xs text-danger">{erreur}</p>}
    </div>
  )
}

/* ─── Skeleton ─────────────────────────────────────────────────────────── */

function DossierDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-52 rounded bg-gray-200" />
          <div className="h-3 w-32 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-px bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="h-px bg-gray-200" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="h-4 w-4 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

type IAEtat = 'idle' | 'loading' | 'done'

/**
 * Modale d'ajout d'une piece cote client. Liste les types disponibles a
 * partir de {@code piecesRequises} (filtree des deja deposees). Si vide,
 * propose les 3 types courants en fallback (PIECE_IDENTITE, etc.).
 */
function ModalAjouterPieceClient({
  open,
  data,
  onClose,
  onSubmit,
}: {
  open: boolean
  data: DossierDetail | null
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

  if (!open || !data) return null

  // Types deja deposes (par code metier, robuste face aux accents/normalisations).
  const codesDeposes = new Set(data.pieces.map((p) => p.codeTypePiece))
  const requises = (data.piecesRequises ?? []).filter(
    (r) => !codesDeposes.has(r.codeTypePiece),
  )
  // Fallback : si le referentiel piecesRequises est vide pour cet abonnement,
  // on propose au moins les 3 types courants pour debloquer l'ajout - filtre
  // egalement par code pour eviter le doublon.
  const fallback = requises.length === 0 ? [
    { codeTypePiece: 'PIECE_IDENTITE', libelleTypePiece: "Pièce d'identité", obligatoire: true },
    { codeTypePiece: 'CERTIFICAT_SCOLARITE', libelleTypePiece: 'Certificat de scolarité', obligatoire: false },
    { codeTypePiece: 'NOTIFICATION_BOURSE', libelleTypePiece: 'Notification de bourse', obligatoire: false },
  ].filter((r) => !codesDeposes.has(r.codeTypePiece)) : []
  const options = requises.length > 0 ? requises : fallback

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
        <h2 className="mb-1 font-heading text-lg font-semibold text-dark">Ajouter une pièce</h2>
        <p className="mb-5 text-sm text-gray-500">
          Choisissez le type de pièce puis le fichier à téléverser.
        </p>

        {options.length === 0 ? (
          <div className="mb-4 rounded-lg bg-blue-pale p-3 text-sm text-primary">
            Tous les types de pièces possibles ont déjà été déposés.
          </div>
        ) : (
          <>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Type de pièce
            </label>
            <select
              value={codeTypePiece}
              onChange={(e) => setCodeTypePiece(e.target.value)}
              className="mb-4 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Sélectionner —</option>
              {options.map((r) => (
                <option key={r.codeTypePiece} value={r.codeTypePiece}>
                  {r.libelleTypePiece}
                  {r.obligatoire ? '' : ' (optionnel)'}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
          Fichier
        </label>
        <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-3 transition hover:border-primary">
          <FileText size={18} className="shrink-0 text-primary" aria-hidden />
          <span className="flex-1 truncate text-sm text-gray-700">
            {file ? file.name : 'Choisir un fichier…'}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!codeTypePiece || !file || submitting}
            className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-focus disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? 'Envoi…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DossierDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const idNum = Number(id)

  const [data, setData] = useState<DossierDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmerResilier, setConfirmerResilier] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [iaEtat, setIaEtat] = useState<IAEtat>('idle')
  const [iaPreVerifie, setIaPreVerifie] = useState(false)

  // Pièces localement uploadées : codeTypePiece → PieceUploaded
  const [piecesLocales, setPiecesLocales] = useState<PieceJustificative[]>([])
  const [uploadedByCode, setUploadedByCode] = useState<Record<string, PieceUploaded>>({})
  const [ajoutOuvert, setAjoutOuvert] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    fetchDossierDetail(idNum)
      .then((d) => { if (!cancelled) { setData(d); setError(null) } })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout()
          navigate({ to: '/login' })
          return
        }
        setError(err instanceof ApiError ? 'Impossible de charger le dossier.' : 'Serveur inaccessible.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [idNum, navigate])

  // Pré-remplir uploadedByCode depuis les pièces déjà en base (affiche "Modifier" au chargement)
  useEffect(() => {
    if (!data) return
    setUploadedByCode((prev) => {
      const next = { ...prev }
      for (const req of data.piecesRequises) {
        const dbPiece = data.pieces.find((p) => {
          const lib = p.libelleTypePiece.toLowerCase()
          const reqLib = req.libelleTypePiece.toLowerCase()
          return lib === reqLib || p.cheminFichier?.includes(req.codeTypePiece.toLowerCase())
        })
        if (dbPiece?.cheminFichier && !next[req.codeTypePiece]) {
          const nom = dbPiece.cheminFichier.split('/').pop() ?? dbPiece.cheminFichier
          next[req.codeTypePiece] = { nom, cle: dbPiece.cheminFichier }
        }
      }
      return next
    })
  }, [data])

  async function handleAjouterPiece(codeTypePiece: string, file: File): Promise<boolean> {
    try {
      await ajouterPiece(idNum, file, codeTypePiece)
      const fresh = await fetchDossierDetail(idNum)
      setData(fresh)
      setPiecesLocales([])
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert('Une pièce de ce type existe déjà — utilisez « Remplacer ».')
      } else {
        window.alert("Échec de l'envoi. Réessayez.")
      }
      return false
    }
  }

  async function handleRemplacerPiece(piece: PieceJustificative, file: File) {
    try {
      await remplacerFichierPiece(idNum, piece.id, file)
      // Refetch pour reprendre la nouvelle dateDepot/statut/cheminFichier.
      const fresh = await fetchDossierDetail(idNum)
      setData(fresh)
      setPiecesLocales([])
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        window.alert('Cette pièce ne peut pas être modifiée pour le moment.')
      } else {
        window.alert("Échec de l'envoi. Réessayez.")
      }
    }
  }

  function onPieceSaved(codeType: string, libelle: string, uploaded: PieceUploaded) {
    setUploadedByCode((prev) => ({ ...prev, [codeType]: uploaded }))
    // Affichage immédiat pendant le rechargement depuis le serveur
    setPiecesLocales((prev) => {
      const filtered = prev.filter((p) => p.libelleTypePiece !== libelle)
      return [...filtered, {
        id: Date.now(),
        codeTypePiece: codeType,
        libelleTypePiece: libelle,
        statutValidation: 'en_attente',
        dateDepot: new Date().toISOString(),
        motifRejet: null,
        cheminFichier: uploaded.cle,
        modifieParAgent: false,
      }]
    })
    // Recharger depuis le serveur pour synchroniser data.pieces (persistance entre sessions)
    fetchDossierDetail(idNum)
      .then((fresh) => { setData(fresh); setPiecesLocales([]) })
      .catch(() => { /* affichage local conservé si le rechargement échoue */ })
  }

  // Toutes les pièces : DB + locales (les locales écrasent par libellé)
  function toutesLesPieces(): PieceJustificative[] {
    if (!data) return piecesLocales
    const dbPieces = data.pieces.filter(
      (p) => !piecesLocales.some((l) => l.libelleTypePiece === p.libelleTypePiece)
    )
    return [...dbPieces, ...piecesLocales]
  }

  // La CNI est obligatoire pour soumettre
  function peutSoumettre(): boolean {
    if (!data) return false
    const obligatoires = (data.piecesRequises ?? []).filter((r) => r.obligatoire)
    if (obligatoires.length === 0) return toutesLesPieces().length > 0
    return obligatoires.every((r) => {
      if (uploadedByCode[r.codeTypePiece]) return true
      return toutesLesPieces().some((p) => {
        const lib = p.libelleTypePiece.toLowerCase()
        return lib === r.libelleTypePiece.toLowerCase() || p.cheminFichier?.includes(r.codeTypePiece.toLowerCase())
      })
    })
  }

  async function onResilier() {
    if (!confirmerResilier) { setConfirmerResilier(true); return }
    setSubmitting(true)
    try {
      await resilierDossier(idNum)
      navigate({ to: '/dashboard' })
    } catch {
      setError('Erreur lors de la résiliation.')
      setSubmitting(false)
    }
  }

  async function onSoumettre() {
    setSubmitting(true)
    try {
      // Les pièces ont déjà été persistées individuellement à l'upload,
      // on soumet sans re-envoyer les clés.
      await soumettreEnVerification(idNum, [])
      navigate({ to: '/dashboard' })
    } catch {
      setError('Erreur lors de la soumission.')
      setSubmitting(false)
    }
  }

  async function onSupprimerConfirme() {
    setShowDeleteModal(false)
    setSubmitting(true)
    try {
      await supprimerDossier(idNum)
      navigate({ to: '/dashboard' })
    } catch {
      setError('Erreur lors de la suppression.')
      setSubmitting(false)
    }
  }

  function onPreVerifierIA() {
    setIaEtat('loading')
    setTimeout(() => { setIaEtat('done'); setIaPreVerifie(true) }, 2000)
  }

  const codeStatut = data?.statut.code ?? ''
  const categorie = categorieFromCode(codeStatut)
  const isActif = codeStatut === 'ACTIF' || codeStatut === 'VALIDE'
  const isBrouillon = codeStatut === 'BROUILLON' || codeStatut === 'EN_ATTENTE_PAIEMENT'
  const isIncomplet = codeStatut === 'INCOMPLET'
  const canEdit = isBrouillon || isIncomplet

  const userName = data ? `${data.titulaire.prenom} ${data.titulaire.nom}` : ''

  return (
    <DashboardLayout title="Mon abonnement" userName={userName} alertes={[]}>
      <ModalAjouterPieceClient
        open={ajoutOuvert}
        data={data}
        onClose={() => setAjoutOuvert(false)}
        onSubmit={handleAjouterPiece}
      />
      <div className="mx-auto max-w-2xl">

        {/* ── Retour ── */}
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Retour au tableau de bord"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary focus:outline-none"
        >
          <ArrowLeft size={16} aria-hidden />
          Retour à mes abonnements
        </button>

        {loading && <DossierDetailSkeleton />}

        {error && (
          <p role="alert" className="text-sm text-danger">{error}</p>
        )}

        {data && (
          <div className="space-y-8">

            {/* ── Titre + statut ── */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-dark">
                  {data.typeAbonnement.libelle}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Créé le {formatDate(data.dateCreation)}
                </p>
              </div>
              <StatusBadge libelle={data.statut.libelle} categorie={categorie} />
            </div>

            {/* ── Infos ── */}
            <section aria-label="Informations sur l'abonnement">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Informations
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <InfoItem label="Titulaire" value={`${data.titulaire.prenom} ${data.titulaire.nom}`} />
                <InfoItem label="Payeur" value={`${data.payeur.prenom} ${data.payeur.nom}`} />
                <InfoItem label="Type" value={data.typeAbonnement.libelle} />
              </dl>

              <div className="mt-6 flex flex-wrap gap-6">
                <div className="flex items-start gap-2">
                  <CalendarDays size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Période</p>
                    <p className="mt-0.5 text-sm text-dark">
                      {formatDate(data.dateDebutDroits)} → {formatDate(data.dateFinDroits)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Montant</p>
                    <p className="mt-0.5 text-sm text-dark">{formatMontant(data.montantTotal)}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-200" />

            {/* ── Pièces ── */}
            <section aria-label="Pièces justificatives">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Pièces justificatives
                </h2>
                {canEdit && (() => {
                  // Calcule s'il reste un type a proposer (meme logique que la
                  // modale) pour griser le bouton si tout est deja depose.
                  const codesDeposes = new Set(data.pieces.map((p) => p.codeTypePiece))
                  const requises = (data.piecesRequises ?? []).filter((r) => !codesDeposes.has(r.codeTypePiece))
                  const fallbackCodes = ['PIECE_IDENTITE', 'CERTIFICAT_SCOLARITE', 'NOTIFICATION_BOURSE']
                  const fallbackDispo = requises.length === 0 && fallbackCodes.some((c) => !codesDeposes.has(c))
                  const peutAjouter = requises.length > 0 || fallbackDispo
                  return (
                    <button
                      type="button"
                      onClick={() => setAjoutOuvert(true)}
                      disabled={!peutAjouter}
                      title={peutAjouter ? undefined : 'Toutes les pièces possibles sont déjà déposées.'}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-blue-pale hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700"
                    >
                      + Ajouter une pièce
                    </button>
                  )
                })()}
              </div>

              <TableauPieces
                pieces={toutesLesPieces()}
                canEdit={canEdit}
                onRemplacer={(piece, file) => void handleRemplacerPiece(piece, file)}
              />
            </section>

            {/* ── Résiliation ── */}
            {isActif && (
              <>
                <div className="h-px bg-gray-200" />
                <section aria-label="Résiliation">
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Résiliation
                  </h2>
                  <p className="mb-4 text-sm text-gray-600">
                    La résiliation est définitive et immédiate. Vous ne pourrez plus utiliser votre abonnement.
                  </p>

                  {confirmerResilier && (
                    <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
                      Confirmez-vous la résiliation de cet abonnement ?
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={onResilier}
                      className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger/30 disabled:opacity-50"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {confirmerResilier ? 'Confirmer' : 'Résilier mon abonnement'}
                    </button>
                    {confirmerResilier && (
                      <button
                        type="button"
                        onClick={() => setConfirmerResilier(false)}
                        className="text-sm font-medium text-gray-500 hover:text-dark"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* ── Documents à compléter ── */}
            {canEdit && (
              <>
                <div className="h-px bg-gray-200" />
                <section aria-label="Documents">
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {isIncomplet ? 'Compléter vos pièces' : 'Ajouter vos documents'}
                  </h2>

                  {isIncomplet && (
                    <p className="mb-4 mt-2 text-sm text-warning">
                      Des pièces sont manquantes ou ont été rejetées. Déposez-les à nouveau pour soumettre votre dossier.
                    </p>
                  )}

                  <div className="mt-4 space-y-3">
                    {(data.piecesRequises ?? [])
                      .filter((req) => {
                        // Montrer uniquement les pièces manquantes ou rejetées
                        const existing = toutesLesPieces().find((p) => {
                          const lib = p.libelleTypePiece.toLowerCase()
                          return lib === req.libelleTypePiece.toLowerCase() || p.cheminFichier?.includes(req.codeTypePiece.toLowerCase())
                        })
                        return !existing || existing.statutValidation === 'rejete' || existing.statutValidation === 'rejetee'
                      })
                      .map((req) => (
                        <ChampFichier
                          key={req.codeTypePiece}
                          label={`${req.libelleTypePiece} — ${data.titulaire.prenom} ${data.titulaire.nom}`}
                          typePiece={req.codeTypePiece as TypePiece}
                          valeur={uploadedByCode[req.codeTypePiece] ?? null}
                          idDossier={idNum}
                          onSaved={(u) => onPieceSaved(req.codeTypePiece, req.libelleTypePiece, u)}
                        />
                      ))}
                    {(data.piecesRequises ?? []).filter((req) => {
                      const existing = toutesLesPieces().find((p) => {
                        const lib = p.libelleTypePiece.toLowerCase()
                        return lib === req.libelleTypePiece.toLowerCase() || p.cheminFichier?.includes(req.codeTypePiece.toLowerCase())
                      })
                      return !existing || existing.statutValidation === 'rejete' || existing.statutValidation === 'rejetee'
                    }).length === 0 && (
                      <p className="text-sm text-success">Tous les documents requis ont été déposés.</p>
                    )}
                  </div>

                  {iaEtat === 'loading' && (
                    <div className="mt-4 flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <p className="text-sm text-gray-600">Vérification IA en cours…</p>
                    </div>
                  )}

                  {iaEtat === 'done' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-success">
                      <BadgeCheck size={16} />
                      Documents pré-vérifiés — aucune anomalie détectée.
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {!iaPreVerifie && iaEtat === 'idle' && (
                      <button
                        type="button"
                        disabled={toutesLesPieces().length === 0}
                        onClick={onPreVerifierIA}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40 sm:w-auto"
                      >
                        <Sparkles size={14} aria-hidden />
                        Pré-vérifier avec l'IA
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={submitting || !peutSoumettre()}
                      onClick={onSoumettre}
                      title={!peutSoumettre() ? "Ajoutez au moins la pièce d'identité pour soumettre" : undefined}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 sm:w-auto"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      Soumettre pour vérification
                    </button>

                    {isBrouillon && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/5 focus:outline-none focus:ring-2 focus:ring-danger/30 disabled:opacity-50 sm:w-auto sm:ml-auto"
                      >
                        Supprimer ce brouillon
                      </button>
                    )}
                  </div>
                </section>
              </>
            )}

          </div>
        )}
      </div>

      {/* ── Modal suppression brouillon ── */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-suppr-titre"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Fond opaque */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="modal-suppr-titre" className="font-heading text-base font-semibold text-dark">
              Supprimer ce brouillon ?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Cette action est irréversible. Le dossier et les documents associés seront définitivement supprimés.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onSupprimerConfirme}
                className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

/* ─── InfoItem ─────────────────────────────────────────────────────────── */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-dark">{value}</dd>
    </div>
  )
}
