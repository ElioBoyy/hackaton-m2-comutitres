import { Link } from '@tanstack/react-router'
import { FileSearch } from 'lucide-react'
import { AbonnementBadge } from '~/components/backoffice/AbonnementBadge'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import type { DossierResume } from '~/lib/types/dossier'

export function DossierTableRow({ dossier }: { dossier: DossierResume }) {
  return (
    <tr className="border-b border-gray-200 last:border-0">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{dossier.nomTitulaire}</td>
      <td className="px-4 py-3">
        <AbonnementBadge typeAbonnement={dossier.typeAbonnement} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{dossier.nbPiecesEnAttente}</td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3">
        <StatusBadge libelle={dossier.statut.libelle} categorie={dossier.statut.categorie} />
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to="/backoffice/dossiers/$id"
          params={{ id: String(dossier.idDossier) }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-blue-pale"
        >
          <FileSearch size={16} />
          Voir le dossier
        </Link>
      </td>
    </tr>
  )
}
