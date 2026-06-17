import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError } from '~/lib/api'
import { isAuthenticated, logout } from '~/lib/auth'
import { fetchDashboard, type DashboardResponse, type FiltreDossiers } from '~/lib/dashboard'
import { DashboardLayout } from '~/components/DashboardLayout'
import { AlerteCard } from '~/components/AlerteCard'
import { DossierCard } from '~/components/DossierCard'
import { FiltreToggle } from '~/components/FiltreToggle'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<FiltreDossiers>('ACTIVE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    let cancelled = false
    setLoading(true)
    fetchDashboard(filtre)
      .then((d) => { if (!cancelled) { setData(d); setError(null) } })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout()
          navigate({ to: '/login' })
          return
        }
        setError(
          err instanceof ApiError
            ? 'Impossible de charger le tableau de bord. Reessayez plus tard.'
            : 'Impossible de joindre le serveur.',
        )
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [navigate, filtre])

  if (!data && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="w-full max-w-sm px-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-pulse bg-primary" />
          </div>
          <p className="mt-3 text-center text-sm text-gray-700">Chargement de votre tableau de bord…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p role="alert" className="text-sm text-danger">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { prenom, nom } = data.utilisateur
  const userName = `${prenom} ${nom}`

  return (
    <DashboardLayout userName={userName} alertes={data.alertes}>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">

        {/* Bandeau de bienvenue */}
        <div className="rounded-2xl bg-primary px-6 py-5 text-white">
          <h1 className="font-heading text-xl font-semibold">Bonjour {prenom}</h1>
          <p className="mt-1 text-sm text-blue-soft">
            Retrouvez ici vos abonnements et notifications.
          </p>
        </div>

        {/* Alertes */}
        {data.alertes.length > 0 && (
          <section aria-labelledby="alertes-titre">
            <h2 id="alertes-titre" className="mb-3 font-heading text-sm font-semibold text-gray-900">
              Notifications
            </h2>
            <div className="flex flex-col gap-3" role="list" aria-label="Liste des alertes">
              {data.alertes.map((a) => (
                <div key={a.idNotification} role="listitem">
                  <AlerteCard alerte={a} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dossiers */}
        <section aria-labelledby="dossiers-titre">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
              <h2 id="dossiers-titre" className="font-heading text-sm font-semibold text-gray-900">
                Mes dossiers
              </h2>
              <FiltreToggle value={filtre} onChange={setFiltre} />
            </div>

            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-700">Chargement des dossiers...</p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-danger">{error}</p>
            ) : data.dossiers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-700">
                {filtre === 'ACTIVE' ? 'Aucun dossier actif.' : 'Aucun dossier.'}
              </p>
            ) : (
              <table className="w-full text-left" aria-label="Liste des dossiers">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Abonnement</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Statut</th>
                    <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 sm:table-cell">Droits</th>
                    <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 sm:table-cell">Montant</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Pieces</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.dossiers.map((d) => (
                    <DossierCard key={d.idDossier} dossier={d} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </DashboardLayout>
  )
}