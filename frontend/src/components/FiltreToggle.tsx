import { m } from '~/paraglide/messages'
import type { FiltreDossiers } from '~/lib/dashboard'

interface FiltreToggleProps {
  value: FiltreDossiers
  onChange: (v: FiltreDossiers) => void
}

export function FiltreToggle({ value, onChange }: FiltreToggleProps) {
  const filtres: { label: string; value: FiltreDossiers }[] = [
    { label: m.dashboard_filter_active(), value: 'ACTIVE' },
    { label: m.dashboard_filter_all(), value: 'ALL' },
  ]

  return (
    <div role="group" aria-label="Filtrer les dossiers" className="flex gap-1 rounded-full bg-gray-100 p-1">
      {filtres.map((filtre) => (
        <button
          key={filtre.value}
          type="button"
          onClick={() => onChange(filtre.value)}
          aria-pressed={value === filtre.value}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
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
