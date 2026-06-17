import { useEffect, useId, useRef, useState } from 'react'
import { searchAddress, type BanAddress } from '~/lib/ban'

interface AddressAutocompleteProps {
  label: string
  value: string
  onChange: (text: string) => void
  onSelect: (address: BanAddress) => void
  onBlur?: () => void
  error?: string
  hint?: string
  required?: boolean
  placeholder?: string
  loadingLabel?: string
  emptyLabel?: string
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  onBlur,
  error,
  hint,
  required,
  placeholder,
  loadingLabel,
  emptyLabel,
}: AddressAutocompleteProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const listId = `${inputId}-list`
  const [results, setResults] = useState<BanAddress[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 3) {
      setResults([])
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      searchAddress(q, ctrl.signal)
        .then((rs) => {
          setResults(rs)
          setActive(rs.length > 0 ? 0 : -1)
        })
        .catch((err) => {
          if ((err as { name?: string }).name !== 'AbortError') {
            setResults([])
          }
        })
        .finally(() => setLoading(false))
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [value])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function pick(addr: BanAddress) {
    onSelect(addr)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      // Bloque le submit implicite : Enter selectionne uniquement une suggestion.
      e.preventDefault()
      if (open && active >= 0 && results[active]) {
        pick(results[active])
      }
      return
    }
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const borderClass = error
    ? 'border-danger focus:border-danger focus:ring-danger/20'
    : 'border-gray-300 focus:border-primary focus:ring-primary/25'

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-medium text-dark">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `${inputId}-opt-${active}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="street-address"
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? 'Commencez à taper votre adresse…'}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-dark placeholder-gray-700 outline-none transition focus:ring-2 ${borderClass}`}
        />
        {open && (loading || results.length > 0 || value.trim().length >= 3) && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-xl border border-gray-300 bg-white shadow-lg"
          >
            {loading && results.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-700">
                {loadingLabel ?? 'Recherche…'}
              </li>
            )}
            {!loading && results.length === 0 && value.trim().length >= 3 && (
              <li className="px-4 py-2 text-sm text-gray-700">
                {emptyLabel ?? 'Aucune adresse trouvée. Précisez le numéro et la rue.'}
              </li>
            )}
            {results.map((r, i) => (
              <li
                key={`${r.label}-${i}`}
                id={`${inputId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(r)
                }}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  i === active ? 'bg-focus/10 text-dark' : 'text-dark'
                }`}
              >
                <div className="font-medium">{r.label}</div>
                <div className="text-xs text-gray-700">
                  {r.codePostal} {r.ville} ({r.departementCode} —{' '}
                  {r.departementLibelle})
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && !error && <p className="text-xs text-gray-700">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
