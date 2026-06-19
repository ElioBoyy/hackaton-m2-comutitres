import { Check, type LucideIcon } from 'lucide-react'

interface ChoiceCardProps {
  label: string
  description?: string
  icon?: LucideIcon
  selected: boolean
  onSelect: () => void
  variant?: 'square' | 'row'
  /** Desactive le clic + applique un style grise. */
  disabled?: boolean
  /** Tooltip native (attribut title) — utile pour expliquer pourquoi disabled. */
  title?: string
}

export function ChoiceCard({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
  variant = 'square',
  disabled = false,
  title,
}: ChoiceCardProps) {
  const baseSelectedStyle = selected
    ? 'border-primary bg-blue-pale'
    : 'border-gray-200 bg-white hover:border-primary-light'
  const disabledStyle = 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-disabled={disabled}
        disabled={disabled}
        title={title}
        className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
          disabled ? disabledStyle : baseSelectedStyle
        }`}
      >
        {Icon ? <Icon className={`h-6 w-6 shrink-0 ${disabled ? 'text-gray-400' : 'text-primary'}`} strokeWidth={1.75} /> : null}
        <span className="flex-1">
          <span className="block font-sans font-semibold text-dark">{label}</span>
          {description ? <span className="block text-sm text-gray-700">{description}</span> : null}
        </span>
        {selected && !disabled ? <Check className="h-5 w-5 shrink-0 text-primary" /> : null}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      title={title}
      className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition-colors ${
        disabled ? disabledStyle : baseSelectedStyle
      }`}
    >
      {Icon ? <Icon className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-primary'}`} strokeWidth={1.75} /> : null}
      <span className="font-sans text-sm font-semibold text-dark">{label}</span>
      {description ? (
        <span className="text-xs leading-tight text-gray-700">{description}</span>
      ) : null}
    </button>
  )
}
