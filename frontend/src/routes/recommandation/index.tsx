import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TicketCheck } from 'lucide-react'
import { Button } from '~/components/ui/Button'

export const Route = createFileRoute('/recommandation/')({
  component: RecommandationIntro,
})

function RecommandationIntro() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-dark bg-white">
          <TicketCheck className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-gray-700 uppercase">
          [ Comutitres Copilot ]
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-dark">
          L'abonnement qui vous correspond, simplement.
        </h1>
        <p className="text-gray-700">
          Un assistant intelligent et inclusif qui vous guide à chaque étape pour
          trouver le meilleur abonnement adapté à votre situation et votre vie.
        </p>
      </div>
      <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
        Commencer
      </Button>
    </main>
  )
}
