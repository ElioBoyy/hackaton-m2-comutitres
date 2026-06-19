import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { logout } from '~/lib/auth'
import { m } from '~/paraglide/messages'

interface Props {
  prenom?: string | null
}

export function HeaderAuthZone({ prenom }: Props) {
  const navigate = useNavigate()

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  if (prenom) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
          >
            {prenom.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {m.dashboard_hello()} {prenom}
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label={m.me_sign_out()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </>
    )
  }

  return (
    <>
      <Link
        to="/login"
        className="text-sm font-medium text-gray-600 transition hover:text-primary"
      >
        {m.auth_sign_in()}
      </Link>
      <Link
        to="/register"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-focus"
      >
        {m.home_signup_cta()}
      </Link>
    </>
  )
}
