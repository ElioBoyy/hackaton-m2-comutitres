import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { SITUATIONS } from '~/domain/situation'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { boursierDefini, situationDefinie } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/situation')({
  component: SituationStep,
})

function SituationStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const situation = useAppSelector((state) => state.wizard.situation)
  const boursier = useAppSelector((state) => state.wizard.boursier)

  return (
    <WizardStepLayout
      etapeCourante={2}
      totalEtapes={4}
      titre="Quelle est votre situation actuelle ?"
      onRetour={() => navigate({ to: '/recommandation/pour-qui' })}
      onSuivant={() => navigate({ to: '/recommandation/frequence' })}
      suivantDesactive={!situation}
      layout="grid"
    >
      {SITUATIONS.map((item) => (
        <ChoiceCard
          key={item.value}
          label={item.label}
          description={item.description}
          icon={item.icon}
          selected={situation === item.value}
          onSelect={() => dispatch(situationDefinie({ situation: item.value }))}
        />
      ))}

      {situation === 'ETUDIANT' ? (
        <label className="col-span-2 flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
          <span className="font-sans text-base font-semibold text-dark">Êtes-vous boursier ?</span>
          <input
            type="checkbox"
            className="h-6 w-6 accent-primary"
            checked={boursier}
            onChange={(event) => dispatch(boursierDefini(event.target.checked))}
          />
        </label>
      ) : null}
    </WizardStepLayout>
  )
}
