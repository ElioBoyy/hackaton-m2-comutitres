import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TicketCheck } from 'lucide-react'
import { Button } from '~/components/Button'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/recommandation/')({
  component: RecommandationIntro,
})

function RecommandationIntro() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-dark bg-white">
          <TicketCheck className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-xs font-semibold tracking-[0.2em] text-gray-700 uppercase">
          [ Comutitres Copilot ]
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-dark">
          {m.wizard_intro_title()}
        </h1>
        <p className="text-gray-700">
          {m.wizard_intro_description()}
        </p>
      </div>
      <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
        {m.wizard_intro_cta()}
      </Button>
    </main>
  )
}
