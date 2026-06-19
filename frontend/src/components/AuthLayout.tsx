import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { LanguageSwitcher } from './LanguageSwitcher'
import { m } from '~/paraglide/messages'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/auth-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/75" aria-hidden="true" />
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <Link to="/" aria-label={m.authlayout_home_aria()} className="mb-6 inline-block relative z-10">
        <img src="/logo.svg" alt="Comutitres" className="h-10 w-auto" />
      </Link>
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_10px_40px_-20px_rgba(37,48,59,0.18)] p-8">
        <h1 className="font-heading text-2xl font-bold text-dark">{title}</h1>
        {subtitle && <p className="text-gray-700 mt-1 mb-6">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>
      {footer && <div className="relative z-10 mt-6 text-sm text-gray-700">{footer}</div>}
    </div>
  )
}
