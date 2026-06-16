import { createFileRoute, Link } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'
import { getAbonnementById } from '~/domain/recommendation'
import { useAppSelector } from '~/store/hooks'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const abonnementSauvegardeId = useAppSelector((state) => state.wizard.abonnementSauvegardeId)
  const abonnement = abonnementSauvegardeId ? getAbonnementById(abonnementSauvegardeId) : null

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">Dashboard</h1>

      {abonnement ? (
        <div className="ticket-card">
          <div className="ticket-card__band">
            <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
              Abonnement sauvegardé
            </span>
          </div>
          <div className="ticket-card__body flex items-center gap-3">
            <Ticket className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.75} />
            <div>
              <p className="font-heading text-lg font-bold text-dark">{abonnement.nom}</p>
              <p className="text-sm text-gray-700">{abonnement.zones}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">
          Aucun abonnement sauvegardé pour l'instant.{' '}
          <Link to="/recommandation" className="text-primary underline">
            Démarrer Comutitres Copilot
          </Link>
        </p>
      )}
    </main>
  )
}
