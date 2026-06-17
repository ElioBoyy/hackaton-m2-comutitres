import type { StatutCategorie } from '~/lib/types/dossier'

const STYLES_PAR_CATEGORIE: Record<StatutCategorie, string> = {
  en_cours: 'bg-warning-light/30 text-warning border border-warning',
  abouti:   'bg-success-light/30 text-success border border-success',
  rejete:   'bg-danger-light/30 text-danger border border-danger',
  clos:     'bg-gray-200 text-gray-600 border border-gray-400',
}

export function StatusBadge({
  libelle,
  categorie,
}: {
  libelle: string
  categorie: StatutCategorie
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STYLES_PAR_CATEGORIE[categorie]}`}
    >
      {libelle}
    </span>
  )
}
