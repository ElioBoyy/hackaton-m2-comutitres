import { useRef, useState } from 'react'
import { BadgeCheck, ExternalLink, FileText, Loader2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { recupererContenu } from '~/lib/fichier'
import type { PieceJustificative } from '~/lib/dossier'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, mo, d] = iso.split('T')[0].split('-')
  return `${d}/${mo}/${y}`
}

/** Bouton "Remplacer" qui declenche un file picker invisible. */
function ActionRemplacer({
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
          const f = e.target.files?.[0]
          if (f) onUpload(f)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        aria-label={`Remplacer ${piece.libelleTypePiece}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} aria-hidden />
        {loading ? 'Envoi…' : 'Remplacer'}
      </button>
    </>
  )
}

export function TableauPieces({
  pieces,
  canEdit = false,
  onRemplacer,
}: {
  pieces: PieceJustificative[]
  /** Si true, affiche un bouton "Remplacer" sur les pièces non encore validées. */
  canEdit?: boolean
  /** Callback quand l'utilisateur a choisi un nouveau fichier pour cette pièce. */
  onRemplacer?: (piece: PieceJustificative, file: File) => void
}) {
  const [ouverturePiece, setOuverturePiece] = useState<number | null>(null)
  const [remplacementId, setRemplacementId] = useState<number | null>(null)

  if (pieces.length === 0) {
    return <p className="text-sm text-gray-500">Aucune pièce déposée.</p>
  }

  async function ouvrir(p: PieceJustificative) {
    if (!p.cheminFichier) return
    setOuverturePiece(p.id)
    try {
      const { url } = await recupererContenu(p.cheminFichier)
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
  }

  return (
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
          {pieces.map((p) => (
            <tr key={p.id} className="border-b border-gray-200 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {p.statutValidation === 'validee'
                    ? <BadgeCheck size={15} className="shrink-0 text-success" />
                    : p.statutValidation === 'rejetee'
                    ? <XCircle size={15} className="shrink-0 text-danger" />
                    : <FileText size={15} className="shrink-0 text-gray-400" />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-dark">{p.libelleTypePiece}</p>
                      {p.modifieParAgent && (
                        <span
                          title="Cette pièce a été déposée ou modifiée par un agent."
                          className="inline-flex items-center gap-1 rounded-full bg-blue-pale px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          <ShieldCheck size={12} aria-hidden="true" />
                          Modifiée par un agent
                        </span>
                      )}
                    </div>
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
                <div className="inline-flex items-center gap-2">
                  {canEdit && onRemplacer && p.cheminFichier && p.statutValidation !== 'validee' && (
                    <ActionRemplacer
                      piece={p}
                      loading={remplacementId === p.id}
                      onUpload={(file) => {
                        setRemplacementId(p.id)
                        onRemplacer(p, file)
                        // L'etat est reinitialise quand la prop pieces change apres le refetch.
                        setTimeout(() => setRemplacementId((prev) => (prev === p.id ? null : prev)), 4000)
                      }}
                    />
                  )}
                  {p.cheminFichier && (
                    <button
                      type="button"
                      disabled={ouverturePiece === p.id}
                      onClick={() => void ouvrir(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      {ouverturePiece === p.id
                        ? <Loader2 size={12} className="animate-spin" aria-hidden />
                        : <ExternalLink size={12} aria-hidden />}
                      Ouvrir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
