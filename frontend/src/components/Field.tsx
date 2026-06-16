import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function Field({ label, hint, error, id, className = '', ...input }: FieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const errorId = `${inputId}-error`
  const borderClass = error
    ? 'border-danger focus:border-danger focus:ring-danger/20'
    : 'border-gray-300 focus:border-primary focus:ring-primary/25'
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-dark">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...input}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-dark placeholder-gray-700 outline-none transition focus:ring-2 ${borderClass} ${className}`}
      />
      {hint && !error && <p className="text-xs text-gray-700">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
