import { useState } from 'react'
import { BadgeCheck, ExternalLink, FileText, Loader2, XCircle } from 'lucide-react'
import { recupererContenu } from '~/lib/fichier'
import type { PieceJustificative } from '~/lib/dossier'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, mo, d] = iso.split('T')[0].split('-')
  return `${d}/${mo}/${y}`
}

export function TableauPieces({ pieces }: { pieces: PieceJustificative[] }) {
  const [ouverturePiece, setOuverturePiece] = useState<number | null>(null)

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
                    onClick={() => void ouvrir(p)}
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
  )
}
