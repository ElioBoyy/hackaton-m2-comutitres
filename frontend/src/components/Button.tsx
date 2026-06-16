import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'w-full rounded-xl px-4 py-3 font-semibold text-base transition outline-none cursor-pointer focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClass =
    variant === 'primary'
      ? 'bg-focus text-white hover:bg-focus/90 active:bg-focus/95'
      : 'bg-gray-200 text-dark hover:bg-gray-300'
  return (
    <button {...rest} className={`${base} ${variantClass} ${className}`}>
      {children}
    </button>
  )
}
