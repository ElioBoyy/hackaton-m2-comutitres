import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError } from '~/lib/api'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { AuthLayout } from '~/components/AuthLayout'
import { Button } from '~/components/Button'

export const Route = createFileRoute('/me')({
  component: MePage,
})

function MePage() {
  const navigate = useNavigate()
  const [profil, setProfil] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    me()
      .then(setProfil)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          // Token rejete (expire ou revoque) : on nettoie et on renvoie sur login.
          logout()
          navigate({ to: '/login' })
          return
        }
        if (err instanceof ApiError && err.status === 404) {
          // Compte supprime cote BDD : on nettoie et on renvoie sur login.
          logout()
          navigate({ to: '/login' })
          return
        }
        setError(
          err instanceof ApiError
            ? 'Impossible de charger le profil. Reessayez plus tard.'
            : 'Impossible de joindre le serveur.',
        )
      })
  }, [navigate])

  function onLogout() {
    logout()
    navigate({ to: '/login' })
  }

  if (error) {
    return (
      <AuthLayout title="Erreur">
        <p className="text-danger">{error}</p>
      </AuthLayout>
    )
  }
  if (!profil) {
    return (
      <AuthLayout title="Chargement..." subtitle="Recuperation de votre profil." >
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full w-1/2 bg-success animate-pulse" />
        </div>
      </AuthLayout>
    )
  }

  const initiales = `${profil.prenom?.[0] ?? ''}${profil.nom?.[0] ?? ''}`.toUpperCase()

  return (
    <AuthLayout
      title="Mon profil"
      subtitle="Vos informations personnelles."
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="grid place-items-center w-14 h-14 rounded-full bg-focus text-white font-heading text-xl font-semibold">
          {initiales || '?'}
        </div>
        <div>
          <p className="font-heading text-lg font-semibold text-dark leading-tight">
            {profil.prenom} {profil.nom}
          </p>
          <p className="text-sm text-gray-700">{profil.email}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 mb-6">
        <ProfilRow label="Identifiant" value={`#${profil.id}`} />
        <ProfilRow label="Email" value={profil.email} />
        <ProfilRow label="Date de naissance" value={formatDate(profil.dateNaissance)} />
      </dl>

      <Button variant="ghost" onClick={onLogout}>
        Se deconnecter
      </Button>
    </AuthLayout>
  )
}

function ProfilRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-100 px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-gray-700">{label}</dt>
      <dd className="text-sm font-medium text-dark">{value}</dd>
    </div>
  )
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
