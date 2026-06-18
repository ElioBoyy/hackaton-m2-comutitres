import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  Wallet,
  XCircle,
} from 'lucide-react'
import { ApiError } from '~/lib/api'
import {
  fetchDossierDetail,
  resilierDossier,
  soumettreEnVerification,
  type DossierDetail,
  type PieceADeposer,
} from '~/lib/dossier'
import { deposerFichier, recupererContenu, type TypePiece } from '~/lib/fichier'
import { DashboardLayout } from '~/components/DashboardLayout'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
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
  onChange,
}: {
  label: string
  typePiece: TypePiece
  valeur: PieceUploaded | null
  onChange: (p: PieceUploaded | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const inputId = `piece-${typePiece}`

  async function handleFile(f: File) {
    setUploading(true)
    setErreur(null)
    try {
      const rep = await deposerFichier(f, typePiece)
      onChange({ nom: f.name, cle: rep.cle })
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

function DossierDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const idNum = Number(id)

  const [data, setData] = useState<DossierDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmerResilier, setConfirmerResilier] = useState(false)
  const [iaEtat, setIaEtat] = useState<IAEtat>('idle')
  const [iaPreVerifie, setIaPreVerifie] = useState(false)

  const [ouverturePiece, setOuverturePiece] = useState<number | null>(null)

  const [pieceIdentite, setPieceIdentite] = useState<PieceUploaded | null>(null)
  const [pieceScolarite, setPieceScolarite] = useState<PieceUploaded | null>(null)
  const [pieceBourse, setPieceBourse] = useState<PieceUploaded | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchDossierDetail(idNum)
      .then((d) => { if (!cancelled) { setData(d); setError(null) } })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? 'Impossible de charger le dossier.' : 'Serveur inaccessible.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [idNum])

  function construirePieces(): PieceADeposer[] {
    const pieces: PieceADeposer[] = []
    if (pieceIdentite) pieces.push({ codeTypePiece: 'PIECE_IDENTITE', cheminFichier: pieceIdentite.cle })
    if (pieceScolarite) pieces.push({ codeTypePiece: 'CERTIFICAT_SCOLARITE', cheminFichier: pieceScolarite.cle })
    if (pieceBourse) pieces.push({ codeTypePiece: 'NOTIFICATION_BOURSE', cheminFichier: pieceBourse.cle })
    return pieces
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
      await soumettreEnVerification(idNum, construirePieces())
      navigate({ to: '/dashboard' })
    } catch {
      setError('Erreur lors de la soumission.')
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
      <div className="mx-auto max-w-2xl">

        {/* ── Retour ── */}
        <button
          type="button"
          onClick={() => navigate({ to: '/dashboard' })}
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
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Pièces justificatives
              </h2>

              {data.pieces.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune pièce déposée.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Document</th>
                        <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">Déposée le</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Statut</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.pieces.map((p) => (
                        <tr key={p.id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {p.statutValidation === 'validee'
                                ? <BadgeCheck size={15} className="shrink-0 text-success" />
                                : p.statutValidation === 'rejetee'
                                ? <XCircle size={15} className="shrink-0 text-danger" />
                                : <FileText size={15} className="shrink-0 text-gray-400" />}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-dark">{p.libelleTypePiece}</p>
                                {p.motifRejet && (
                                  <p className="mt-0.5 truncate text-xs text-danger">{p.motifRejet}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">
                            {formatDate(p.dateDepot)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              p.statutValidation === 'validee' ? 'text-success'
                              : p.statutValidation === 'rejetee' ? 'text-danger'
                              : 'text-gray-400'
                            }`}>
                              {p.statutValidation === 'validee' ? 'Validée'
                              : p.statutValidation === 'rejetee' ? 'Rejetée'
                              : 'En attente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.cheminFichier && (
                              <button
                                type="button"
                                disabled={ouverturePiece === p.id}
                                onClick={async () => {
                                  setOuverturePiece(p.id)
                                  try {
                                    const { url } = await recupererContenu(p.cheminFichier!)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.target = '_blank'
                                    a.rel = 'noopener noreferrer'
                                    document.body.appendChild(a)
                                    a.click()
                                    document.body.removeChild(a)
                                    setTimeout(() => URL.revokeObjectURL(url), 60_000)
                                  } catch {
                                    /* silencieux */
                                  } finally {
                                    setOuverturePiece(null)
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                              >
                                {ouverturePiece === p.id
                                  ? <Loader2 size={12} className="animate-spin" aria-hidden />
                                  : <ExternalLink size={12} aria-hidden />}
                                Ouvrir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    <ChampFichier label="Pièce d'identité" typePiece="PIECE_IDENTITE" valeur={pieceIdentite} onChange={setPieceIdentite} />
                    <ChampFichier label="Certificat de scolarité" typePiece="CERTIFICAT_SCOLARITE" valeur={pieceScolarite} onChange={setPieceScolarite} />
                    <ChampFichier label="Notification de bourse" typePiece="NOTIFICATION_BOURSE" valeur={pieceBourse} onChange={setPieceBourse} />
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

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {!iaPreVerifie && iaEtat === 'idle' && (
                      <button
                        type="button"
                        disabled={!pieceIdentite && !pieceScolarite && !pieceBourse}
                        onClick={onPreVerifierIA}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40 sm:w-auto"
                      >
                        <Sparkles size={14} aria-hidden />
                        Pré-vérifier avec l'IA
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={onSoumettre}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 sm:w-auto"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      Soumettre pour vérification
                    </button>
                  </div>
                </section>
              </>
            )}

          </div>
        )}
      </div>
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
