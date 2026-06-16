import * as React from 'react'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-focus disabled:bg-gray-300 disabled:text-gray-700',
  secondary:
    'bg-transparent text-dark border border-gray-300 hover:bg-gray-100',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-5 py-2.5 font-sans font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
