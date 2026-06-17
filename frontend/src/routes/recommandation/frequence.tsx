import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { FREQUENCES_DEPLACEMENT } from '~/domain/frequenceDeplacement'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { frequenceDeplacementDefinie } from '~/store/wizardSlice'

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
      titre={pourQui === 'TIERS' ? "À quelle fréquence le bénéficiaire se déplace-t-il ?" : "À quelle fréquence vous déplacez-vous ?"}
      onRetour={() => navigate({ to: '/recommandation/situation' })}
      onSuivant={() => navigate({ to: '/recommandation/residence' })}
      suivantDesactive={!frequenceDeplacement}
    >
      {FREQUENCES_DEPLACEMENT.map((item) => (
        <ChoiceCard
          key={item.value}
          variant="row"
          label={item.label}
          description={item.description}
          icon={item.icon}
          selected={frequenceDeplacement === item.value}
          onSelect={() => dispatch(frequenceDeplacementDefinie(item.value))}
        />
      ))}
    </WizardStepLayout>
  )
}
