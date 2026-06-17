import type { StatutCategorie } from '~/lib/types/dossier'

const FILTRES: { label: string; value: StatutCategorie | 'tous' }[] = [
  { label: 'Tous', value: 'tous' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Aboutis', value: 'abouti' },
  { label: 'Rejetes', value: 'rejete' },
  { label: 'Clos', value: 'clos' },
]

export function DossierStatusFilter({
  value,
  onChange,
}: {
  value: StatutCategorie | 'tous'
  onChange: (value: StatutCategorie | 'tous') => void
}) {
  return (
    <div className="flex gap-1 rounded-full bg-gray-100 p-1">
      {FILTRES.map((filtre) => (
        <button
          key={filtre.value}
          type="button"
          onClick={() => onChange(filtre.value)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            value === filtre.value
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {filtre.label}
        </button>
      ))}
    </div>
  )
}
