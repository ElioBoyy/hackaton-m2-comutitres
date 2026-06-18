import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { POUR_QUI } from '~/domain/pourQui'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { pourQuiDefini } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/pour-qui')({
  component: PourQuiStep,
})

const POUR_QUI_LABELS: Record<string, () => string> = {
  MOI: m.wizard_pour_qui_moi,
  TIERS: m.wizard_pour_qui_tiers,
}

const POUR_QUI_DESCRIPTIONS: Record<string, (() => string) | undefined> = {
  TIERS: m.wizard_pour_qui_tiers_description,
}

function PourQuiStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pourQui = useAppSelector((state) => state.wizard.pourQui)

  return (
    <WizardStepLayout
      etapeCourante={1}
      totalEtapes={4}
      titre={m.wizard_pour_qui_title()}
      onRetour={() => navigate({ to: '/recommandation' })}
      onSuivant={() => navigate({ to: '/recommandation/situation' })}
      suivantDesactive={!pourQui}
      layout="grid"
    >
      {POUR_QUI.map((item) => (
        <ChoiceCard
          key={item.value}
          label={POUR_QUI_LABELS[item.value]?.() ?? item.label}
          description={POUR_QUI_DESCRIPTIONS[item.value]?.()}
          icon={item.icon}
          selected={pourQui === item.value}
          onSelect={() => dispatch(pourQuiDefini(item.value))}
        />
      ))}
    </WizardStepLayout>
  )
}
