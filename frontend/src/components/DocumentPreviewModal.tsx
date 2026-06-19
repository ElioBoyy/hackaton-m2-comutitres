import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { recupererContenu } from '~/lib/fichier'
import { m } from '~/paraglide/messages'

interface DocumentPreviewModalProps {
  /** Cle/chemin du fichier dans MinIO ({@code cheminFichier}). */
  cheminFichier: string
  /** Titre affiche dans l'en-tete de la modale (ex: libelle du type de piece). */
  titre: string
  onClose: () => void
}

/**
 * Modale plein ecran cote client : visionneuse only (pas de panneau d'actions
 * a droite, contrairement a la version backoffice).
 *
 * <p>Recupere le contenu via {@code GET /fichiers/contenu} (blob authentifie
 * sans URL signee qui fuiterait). Rend inline {@code application/pdf}
 * (iframe), {@code image/&#42;} (img), ou propose un download fallback pour
 * les autres types. Le blob URL est revoque au demontage pour eviter les
 * fuites memoire.
 */
export function DocumentPreviewModal({ cheminFichier, titre, onClose }: DocumentPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [contentType, setContentType] = useState<string>('')
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!cheminFichier) {
      setErreur(m.bo_dossier_modal_no_file_path())
      return
    }
    let revokeUrl: string | null = null
    let cancelled = false
    recupererContenu(cheminFichier)
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
        if (!cancelled) setErreur(m.bo_dossier_modal_cannot_open())
      })
    return () => {
      cancelled = true
      if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
  }, [cheminFichier])

  // Fermeture au clavier (Escape) — parite avec le pattern modal habituel.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const estPdf = contentType.startsWith('application/pdf')
  const estImage = contentType.startsWith('image/')

  return (
    <div
      className="fixed inset-0 z-[1100] flex flex-col bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label={titre}
    >
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 text-white">
        <h2 className="font-heading text-sm font-semibold">{titre}</h2>
        <div className="flex items-center gap-1">
          {blobUrl && !estPdf && !estImage && (
            <a
              href={blobUrl}
              download
              aria-label={m.bo_dossier_modal_download_fallback()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <Download size={18} aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={m.bo_dossier_modal_close_viewer()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {erreur ? (
          <p role="alert" className="text-sm text-red-300">{erreur}</p>
        ) : !blobUrl ? (
          <p className="text-sm text-gray-300" aria-live="polite">{m.common_loading_short()}</p>
        ) : estPdf ? (
          <iframe
            src={blobUrl}
            title={titre}
            className="h-full w-full rounded-lg bg-white"
          />
        ) : estImage ? (
          <img
            src={blobUrl}
            alt={titre}
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
    </div>
  )
}
