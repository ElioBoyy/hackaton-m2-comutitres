import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'
import { ApiError } from '~/lib/api'
import { agentMe } from '~/lib/agentAuth'
import { isAuthenticated, logout } from '~/lib/auth'

export const Route = createFileRoute('/backoffice/dossiers/$id')({
  component: DossierDetail,
})

function DossierDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [agentName, setAgentName] = useState<string | null>(null)

  function handleUnauthorized() {
    logout()
    navigate({ to: '/backoffice/login' })
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/backoffice/login' })
      return
    }
    agentMe()
      .then((agent) => setAgentName(`${agent.prenom} ${agent.nom}`))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          handleUnauthorized()
          return
        }
        if (err instanceof ApiError && err.status === 403) {
          navigate({ to: '/not-found' })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!agentName) {
    return null
  }

  return (
    <BackofficeLayout agentName={agentName} onLogout={handleUnauthorized}>
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-700">Dossier #{id}</p>
        <h1 className="mt-2 font-heading text-lg font-semibold text-gray-900">
          Detail du dossier — a venir
        </h1>
      </div>
    </BackofficeLayout>
  )
}
