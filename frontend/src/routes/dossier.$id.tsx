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
import { ApiError, remplacerFichierPiece } from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import {
  fetchDossierDetail,
  lancerPreVerificationIA,
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
import { m } from '~/paraglide/messages'
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
            {uploading ? m.champ_uploading() : valeur ? valeur.nom : m.champ_no_file()}
          </p>
        </div>
        {!uploading && (
          <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            valeur ? 'bg-success/10 text-success' : 'bg-blue-pale text-primary'
          }`}>
            {valeur ? m.common_modify() : m.common_choose()}
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

  // Pièces localement uploadées : codeTypePiece → PieceUploaded
  const [piecesLocales, setPiecesLocales] = useState<PieceJustificative[]>([])
  const [uploadedByCode, setUploadedByCode] = useState<Record<string, PieceUploaded>>({})

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    fetchDossierDetail(idNum)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(null)
      })
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

  // Resync iaEtat sur changement de pieces (upload, remplacement, validation).
  // Le 'loading' transitoire de la pre-verification est laisse intact ; 'done'
  // est garde tant que toutes les pieces non rejetees sont verifiees, sinon
  // on revient a 'idle' pour reafficher le bouton "Pre-verifier".
  useEffect(() => {
    if (!data) return
    setIaEtat((prev) => {
      if (prev === 'loading') return prev
      const aDesNonVerifiees = data.pieces.some(
        (p) => !p.verifieParIA && p.statutValidation !== 'rejetee',
      )
      const aDesVerifiees = data.pieces.some((p) => p.verifieParIA)
      if (!aDesNonVerifiees && aDesVerifiees) return 'done'
      return 'idle'
    })
  }, [data])

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
        verifieParIA: false,
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
    // Delai pour mimer le traitement IA cote UX, puis persiste cote backend
    // afin que l'agent voie le flag dans le backoffice.
    setTimeout(() => {
      lancerPreVerificationIA(idNum)
        .then((fresh) => {
          setData(fresh)
          setIaEtat('done')
        })
        .catch(() => {
          setIaEtat('idle')
          window.alert("Échec de la pré-vérification IA. Réessayez.")
        })
    }, 2000)
  }

  const codeStatut = data?.statut.code ?? ''
  const categorie = categorieFromCode(codeStatut)
  const isActif = codeStatut === 'ACTIF' || codeStatut === 'VALIDE'
  const isBrouillon = codeStatut === 'BROUILLON' || codeStatut === 'EN_ATTENTE_PAIEMENT'
  const isIncomplet = codeStatut === 'INCOMPLET'
  const canEdit = isBrouillon || isIncomplet

  const estActifOuValide = codeStatut === 'ACTIF' || codeStatut === 'VALIDE'
  const aDesDroitsConnus = estActifOuValide
    && ((data?.dateDebutDroits ?? null) !== null || (data?.dateFinDroits ?? null) !== null)
  const todayMs = new Date(); todayMs.setHours(0, 0, 0, 0)
  const actifFutur =
    codeStatut === 'ACTIF' &&
    data?.dateDebutDroits != null &&
    new Date(data.dateDebutDroits).getTime() > todayMs.getTime()
  const libelleStatut = actifFutur
    ? m.dossier_card_active_from({ date: formatDate(data?.dateDebutDroits) })
    : data?.statut.libelle ?? ''

  const userName = data ? `${data.titulaire.prenom} ${data.titulaire.nom}` : ''

  return (
    <DashboardLayout title={m.dossier_layout_title()} userName={userName} alertes={[]}>
      <div className="mx-auto max-w-2xl">

        {/* ── Retour ── */}
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label={m.dossier_back_aria()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary focus:outline-none"
        >
          <ArrowLeft size={16} aria-hidden />
          {m.dossier_back_link()}
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
                  {m.dossier_created_on({ date: formatDate(data.dateCreation) })}
                </p>
              </div>
              <StatusBadge libelle={libelleStatut} categorie={categorie} />
            </div>

            {/* ── Infos ── */}
            <section aria-label={m.dossier_section_info_aria()}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                {m.dossier_section_info_title()}
              </h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <InfoItem label={m.dossier_info_holder()} value={`${data.titulaire.prenom} ${data.titulaire.nom}`} />
                <InfoItem label={m.dossier_info_payer()} value={`${data.payeur.prenom} ${data.payeur.nom}`} />
                <InfoItem label={m.dossier_info_type()} value={data.typeAbonnement.libelle} />
              </dl>

              <div className="mt-6 flex flex-wrap gap-6">
                {aDesDroitsConnus && (
                  <div className="flex items-start gap-2">
                    <CalendarDays size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-gray-500">{m.dossier_info_period()}</p>
                      <p className="mt-0.5 text-sm text-dark">
                        {data.dateFinDroits
                          ? m.dossier_info_period_range({ start: formatDate(data.dateDebutDroits), end: formatDate(data.dateFinDroits) })
                          : m.dossier_info_period_open({ start: formatDate(data.dateDebutDroits) })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Wallet size={15} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
                  <div>
                    <p className="text-xs font-semibold text-gray-500">{m.dossier_info_amount()}</p>
                    <p className="mt-0.5 text-sm text-dark">{formatMontant(data.montantTotal)}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-200" />

            {/* ── Pièces ── */}
            <section aria-label={m.dossier_pieces_aria()}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {m.dossier_pieces_title()}
                </h2>
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
                <section aria-label={m.dossier_section_resiliation_aria()}>
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {m.dossier_resiliation_title()}
                  </h2>
                  <p className="mb-4 text-sm text-gray-600">
                    {m.dossier_resiliation_warning()}
                  </p>

                  {confirmerResilier && (
                    <p className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
                      {m.dossier_resiliation_confirm_question()}
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
                      {confirmerResilier ? m.common_confirm() : m.dossier_resilier_button()}
                    </button>
                    {confirmerResilier && (
                      <button
                        type="button"
                        onClick={() => setConfirmerResilier(false)}
                        className="text-sm font-medium text-gray-500 hover:text-dark"
                      >
                        {m.common_cancel()}
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
                <section aria-label={m.dossier_documents_aria()}>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {isIncomplet ? m.dossier_complete_pieces() : m.dossier_add_documents()}
                  </h2>

                  {isIncomplet && (
                    <p className="mb-4 mt-2 text-sm text-warning">
                      {m.dossier_pieces_missing_warning()}
                    </p>
                  )}

                  <div className="mt-4 space-y-3">
                    {(() => {
                      // Source des pieces a uploader : referentiel piecesRequises si
                      // defini pour ce type d'abonnement, sinon fallback sur les 3
                      // types courants pour debloquer l'utilisateur cote front (cas
                      // ou le seed n'a pas de piece_requise pour ce type).
                      const FALLBACK = [
                        { codeTypePiece: 'PIECE_IDENTITE', libelleTypePiece: m.dossier_piece_identity_label(), obligatoire: true },
                        { codeTypePiece: 'CERTIFICAT_SCOLARITE', libelleTypePiece: m.dossier_piece_certificat_scolarite(), obligatoire: false },
                        { codeTypePiece: 'NOTIFICATION_BOURSE', libelleTypePiece: m.dossier_piece_notification_bourse(), obligatoire: false },
                      ]
                      const source = (data.piecesRequises ?? []).length > 0
                        ? (data.piecesRequises ?? [])
                        : FALLBACK
                      const codesDeposes = new Set(data.pieces.map((p) => p.codeTypePiece))
                      const aUploader = source.filter((req) => {
                        const existing = toutesLesPieces().find((p) => {
                          const lib = p.libelleTypePiece.toLowerCase()
                          return lib === req.libelleTypePiece.toLowerCase() || p.cheminFichier?.includes(req.codeTypePiece.toLowerCase())
                        })
                        const matchedByCode = codesDeposes.has(req.codeTypePiece)
                        const pieceExistante = existing ?? (matchedByCode ? data.pieces.find((p) => p.codeTypePiece === req.codeTypePiece) : undefined)
                        return !pieceExistante || pieceExistante.statutValidation === 'rejete' || pieceExistante.statutValidation === 'rejetee'
                      })
                      return (
                        <>
                          {aUploader.map((req) => (
                            <ChampFichier
                              key={req.codeTypePiece}
                              label={req.libelleTypePiece}
                              typePiece={req.codeTypePiece as TypePiece}
                              valeur={uploadedByCode[req.codeTypePiece] ?? null}
                              idDossier={idNum}
                              onSaved={(u) => onPieceSaved(req.codeTypePiece, req.libelleTypePiece, u)}
                            />
                          ))}
                          {(data.piecesRequises ?? []).length > 0 && aUploader.length === 0 && (
                            <p className="text-sm text-success">{m.dossier_all_required_uploaded()}</p>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  {iaEtat === 'loading' && (
                    <div className="mt-4 flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <p className="text-sm text-gray-600">{m.dossier_ia_checking()}</p>
                    </div>
                  )}

                  {iaEtat === 'done' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-success">
                      <BadgeCheck size={16} />
                      {m.dossier_ia_done()}
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {(() => {
                      // Bouton "Pré-vérifier avec l'IA" visible tant qu'il y a au
                      // moins une piece non rejetee non encore verifiee par l'IA.
                      const aVerifier = toutesLesPieces().some(
                        (p) => !p.verifieParIA && p.statutValidation !== 'rejetee',
                      )
                      return iaEtat === 'idle' && aVerifier ? (
                        <button
                          type="button"
                          disabled={toutesLesPieces().length === 0}
                          onClick={onPreVerifierIA}
                          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40 sm:w-auto"
                        >
                          <Sparkles size={14} aria-hidden />
                          {m.dossier_pre_verify_ia()}
                        </button>
                      ) : null
                    })()}

                    <button
                      type="button"
                      disabled={submitting || !peutSoumettre()}
                      onClick={onSoumettre}
                      title={!peutSoumettre() ? m.dossier_submit_min_piece_tooltip() : undefined}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 sm:w-auto"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {m.dossier_submit_for_review()}
                    </button>

                    {isBrouillon && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/5 focus:outline-none focus:ring-2 focus:ring-danger/30 disabled:opacity-50 sm:w-auto sm:ml-auto"
                      >
                        {m.dossier_delete_draft_button()}
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
              {m.dossier_delete_draft_title()}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {m.dossier_delete_draft_warning()}
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                {m.common_cancel()}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onSupprimerConfirme}
                className="flex items-center gap-2 rounded-xl bg-danger px-5 py-2 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {m.dossier_delete_confirm()}
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
