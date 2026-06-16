import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { POUR_QUI } from '~/domain/pourQui'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { pourQuiDefini } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/pour-qui')({
  component: PourQuiStep,
})

function PourQuiStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pourQui = useAppSelector((state) => state.wizard.pourQui)

  return (
    <WizardStepLayout
      etapeCourante={1}
      totalEtapes={4}
      titre="Pour qui souhaitez-vous effectuer cette demande ?"
      onRetour={() => navigate({ to: '/recommandation' })}
      onSuivant={() => navigate({ to: '/recommandation/situation' })}
      suivantDesactive={!pourQui}
      layout="grid"
    >
      {POUR_QUI.map((item) => (
        <ChoiceCard
          key={item.value}
          label={item.label}
          description={item.description}
          icon={item.icon}
          selected={pourQui === item.value}
          onSelect={() => dispatch(pourQuiDefini(item.value))}
        />
      ))}
    </WizardStepLayout>
  )
}
