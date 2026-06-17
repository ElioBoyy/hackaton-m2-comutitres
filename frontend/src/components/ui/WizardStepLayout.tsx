import * as React from 'react'
import { ProgressBar } from '~/components/ui/ProgressBar'
import { Button } from '~/components/ui/Button'

interface WizardStepLayoutProps {
  etapeCourante: number
  totalEtapes: number
  titre: string
  onRetour: () => void
  onSuivant: () => void
  suivantDesactive?: boolean
  layout?: 'list' | 'grid'
  children: React.ReactNode
}

export function WizardStepLayout({
  etapeCourante,
  totalEtapes,
  titre,
  onRetour,
  onSuivant,
  suivantDesactive = false,
  layout = 'list',
  children,
}: WizardStepLayoutProps) {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <ProgressBar etapeCourante={etapeCourante} totalEtapes={totalEtapes} />
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{titre}</h1>
      <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
        {children}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-dashed border-gray-300 pt-6">
        <Button variant="secondary" onClick={onRetour}>
          Retour
        </Button>
        <Button onClick={onSuivant} disabled={suivantDesactive} className="flex-1">
          Suivant
        </Button>
      </div>
    </main>
  )
}
