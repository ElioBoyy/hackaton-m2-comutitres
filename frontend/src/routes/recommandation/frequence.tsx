import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { FREQUENCES_DEPLACEMENT } from '~/domain/frequenceDeplacement'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { frequenceDeplacementDefinie } from '~/store/wizardSlice'

const FREQUENCE_LABELS: Record<string, () => string> = {
  QUOTIDIEN: m.wizard_frequence_daily,
  REGULIER: m.wizard_frequence_regular,
  OCCASIONNEL: m.wizard_frequence_occasional,
}

const FREQUENCE_DESCRIPTIONS: Record<string, () => string> = {
  QUOTIDIEN: m.wizard_frequence_daily_description,
  REGULIER: m.wizard_frequence_regular_description,
  OCCASIONNEL: m.wizard_frequence_occasional_description,
}

export const Route = createFileRoute('/recommandation/frequence')({
  component: FrequenceStep,
})

function FrequenceStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pourQui = useAppSelector((state) => state.wizard.pourQui)
  const frequenceDeplacement = useAppSelector((state) => state.wizard.frequenceDeplacement)

  return (
    <WizardStepLayout
      etapeCourante={3}
      totalEtapes={4}
      titre={pourQui === 'TIERS' ? m.wizard_frequence_title_other() : m.wizard_frequence_title_self()}
      onRetour={() => navigate({ to: '/recommandation/situation' })}
      onSuivant={() => navigate({ to: '/recommandation/residence' })}
      suivantDesactive={!frequenceDeplacement}
    >
      {FREQUENCES_DEPLACEMENT.map((item) => (
        <ChoiceCard
          key={item.value}
          variant="row"
          label={FREQUENCE_LABELS[item.value]?.() ?? item.label}
          description={FREQUENCE_DESCRIPTIONS[item.value]?.()}
          icon={item.icon}
          selected={frequenceDeplacement === item.value}
          onSelect={() => dispatch(frequenceDeplacementDefinie(item.value))}
        />
      ))}
    </WizardStepLayout>
  )
}
