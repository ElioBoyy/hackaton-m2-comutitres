import { DossierTableRow } from '~/components/backoffice/DossierTableRow'
import type { DossierResume } from '~/lib/types/dossier'

const COLONNES = ['Titulaire', 'Abonnement', 'Statut', 'Pieces en attente', 'Soumis le', '']

export function DossierTable({
  dossiers,
  loading,
  error,
}: {
  dossiers: DossierResume[]
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return <p className="px-4 py-6 text-sm text-gray-700">Chargement des dossiers...</p>
  }

  if (error) {
    return <p className="px-4 py-6 text-sm text-danger">{error}</p>
  }

  if (dossiers.length === 0) {
    return <p className="px-4 py-6 text-sm text-gray-700">Aucun dossier a verifier.</p>
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-200">
          {COLONNES.map((colonne) => (
            <th
              key={colonne}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700"
            >
              {colonne}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dossiers.map((dossier) => (
          <DossierTableRow key={dossier.idDossier} dossier={dossier} />
        ))}
      </tbody>
    </table>
  )
}
