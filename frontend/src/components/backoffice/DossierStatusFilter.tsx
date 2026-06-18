import { useEffect, useRef, useState } from 'react'
import type { DossierCounts } from '~/lib/api'
import type { StatutCategorie } from '~/lib/types/dossier'

const FILTRES: {
  label: string
  value: StatutCategorie | 'tous'
  textClass: string
  countKey: keyof DossierCounts
}[] = [
  { label: 'En cours', value: 'en_cours', textClass: 'text-warning', countKey: 'enCours' },
  { label: 'Aboutis',  value: 'abouti',   textClass: 'text-success', countKey: 'abouti'  },
  { label: 'Rejetés',  value: 'rejete',   textClass: 'text-danger',  countKey: 'rejete'  },
  { label: 'Clos',     value: 'clos',     textClass: 'text-gray-700',countKey: 'clos'    },
  { label: 'Tous',     value: 'tous',     textClass: 'text-dark',    countKey: 'tous'    },
]

export function DossierStatusFilter({
  value,
  counts,
  onChange,
}: {
  value: StatutCategorie | 'tous'
  counts: DossierCounts | null
  onChange: (value: StatutCategorie | 'tous') => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null)

  const activeIndex = FILTRES.findIndex((f) => f.value === value)

  useEffect(() => {
    const container = containerRef.current
    const btn = buttonRefs.current[activeIndex]
    if (!container || !btn) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }, [activeIndex, counts])

  return (
    <div ref={containerRef} className="relative flex gap-1 rounded-full bg-gray-200 p-1">
      {pillStyle && (
        <span
          className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: pillStyle.left, width: pillStyle.width }}
        />
      )}
      {FILTRES.map((filtre, i) => {
        const isActive = value === filtre.value
        const count = counts?.[filtre.countKey] ?? null
        return (
          <button
            key={filtre.value}
            ref={(el) => { buttonRefs.current[i] = el }}
            type="button"
            onClick={() => onChange(filtre.value)}
            className={`relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? filtre.textClass : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {filtre.label}
            {count !== null && (
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-semibold leading-none text-gray-700">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
