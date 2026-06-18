import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '~/components/DashboardLayout'
import { ApiError } from '~/lib/api'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { type FichierListeEntree, listerFichiers, recupererContenu, type TypePiece } from '~/lib/fichier'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/mes-documents')({
  component: MesDocumentsPage,
})

function MesDocumentsPage() {
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = useState<MeResponse | null>(null)
  const [fichiers, setFichiers] = useState<FichierListeEntree[] | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  // Cle en cours d'ouverture : evite les double-clics et place le lien dans
  // un etat "Ouverture..." pendant que le backend stream le blob.
  const [ouvertureCle, setOuvertureCle] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setChargement(true)
    Promise.all([me(), listerFichiers()])
      .then(([u, liste]) => {
        if (cancelled) return
        // Tri du plus recent au plus ancien (lastModified MinIO).
        liste.sort((a, b) => new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime())
        setUtilisateur(u)
        setFichiers(liste)
        setErreur(null)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout()
          navigate({ to: '/login' })
          return
        }
        setErreur(m.documents_load_error())
      })
      .finally(() => { if (!cancelled) setChargement(false) })
    return () => { cancelled = true }
  }, [navigate])

  async function ouvrir(cle: string) {
    setOuvertureCle(cle)
    try {
      // Recupere le contenu en blob authentifie : pas d'URL signee qui pourrait
      // fuir, l'object URL ne vit que dans cet onglet.
      const { url } = await recupererContenu(cle)
      const lien = document.createElement('a')
      lien.href = url
      lien.target = '_blank'
      lien.rel = 'noopener noreferrer'
      document.body.appendChild(lien)
      lien.click()
      document.body.removeChild(lien)
      // Libere le blob apres un delai laissant au navigateur le temps de
      // l'ouvrir dans le nouvel onglet (sinon il pointe sur du vide).
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setErreur(m.documents_open_error())
    } finally {
      setOuvertureCle(null)
    }
  }

  if (!utilisateur && chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="w-full max-w-sm px-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-pulse bg-primary" />
          </div>
          <p className="mt-3 text-center text-sm text-gray-700">{m.documents_loading()}</p>
        </div>
      </div>
    )
  }

  if (erreur && !fichiers) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p role="alert" className="text-sm text-danger">{erreur}</p>
      </div>
    )
  }

  if (!utilisateur) return null

  const userName = `${utilisateur.prenom} ${utilisateur.nom}`

  return (
    // alertes=[] : on ne fetch pas le dashboard juste pour la pastille cloche.
    <DashboardLayout title={m.nav_my_documents()} userName={userName} alertes={[]}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">

        {erreur ? (
          <p role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {erreur}
          </p>
        ) : null}

        <section aria-labelledby="documents-titre">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
              <h2 id="documents-titre" className="font-heading text-sm font-semibold text-gray-900">
                {m.nav_my_documents()}
              </h2>
            </div>

            {chargement ? (
              <p className="px-4 py-6 text-sm text-gray-700">{m.documents_loading()}</p>
            ) : fichiers && fichiers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-700">{m.documents_empty()}</p>
            ) : fichiers ? (
              <div className="overflow-hidden">
                <table className="w-full text-left" aria-label={m.nav_my_documents()}>
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{m.documents_col_name()}</th>
                      <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">{m.documents_col_size()}</th>
                      <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">{m.documents_col_date()}</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {fichiers.map((fichier) => {
                      const libelle = libelleAffichage(fichier)
                      return (
                      <tr key={fichier.cle} className="border-b border-gray-200 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <FileText size={15} className="shrink-0 text-gray-400" aria-hidden="true" />
                            <p className="truncate text-sm font-medium text-dark">{libelle}</p>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">
                          {formaterTaille(fichier.tailleOctets)}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">
                          {formaterDate(fichier.dateDepot)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => void ouvrir(fichier.cle)}
                            disabled={ouvertureCle === fichier.cle}
                            aria-label={m.documents_open_aria({ name: libelle })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                          >
                            {ouvertureCle === fichier.cle ? (
                              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                            ) : (
                              <ExternalLink size={12} aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                              {ouvertureCle === fichier.cle ? m.documents_opening() : m.documents_open()}
                            </span>
                          </button>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

/**
 * Libelle d'affichage : preferentiellement le nom localise du type (Pièce
 * d'identité, ...) pour les uploads categorises ; sinon le nom de fichier
 * tel quel pour les uploads generiques. Garde une seule source de verite cote
 * i18n via l'enum TypePiece.
 */
function libelleAffichage(fichier: FichierListeEntree): string {
  if (fichier.type) return libelleType(fichier.type)
  return fichier.nomFichier
}

const LIBELLES_TYPE: Partial<Record<TypePiece, () => string>> = {
  PIECE_IDENTITE: m.documents_label_piece_identite,
  CERTIFICAT_SCOLARITE: m.documents_label_certificat_scolarite,
}

function libelleType(type: TypePiece): string {
  return LIBELLES_TYPE[type]?.() ?? type
}

function formaterTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}

function formaterDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
