import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { SITUATIONS } from '~/domain/situation'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { boursierDefini, situationDefinie } from '~/store/wizardSlice'

const SITUATION_LABELS: Record<string, () => string> = {
  ETUDIANT: m.wizard_situation_student,
  ACTIF: m.wizard_situation_worker,
  DEMANDEUR_EMPLOI: m.wizard_situation_unemployed,
  RETRAITE: m.wizard_situation_retired,
  ALTERNANCE: m.wizard_situation_apprentice,
  AUTRE: m.wizard_situation_other,
}

const SITUATION_DESCRIPTIONS: Record<string, (() => string) | undefined> = {
  RETRAITE: m.wizard_situation_retired_description,
  AUTRE: m.wizard_situation_other_description,
}

export const Route = createFileRoute('/recommandation/situation')({
  component: SituationStep,
})

function SituationStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pourQui = useAppSelector((state) => state.wizard.pourQui)
  const situation = useAppSelector((state) => state.wizard.situation)
  const boursier = useAppSelector((state) => state.wizard.boursier)

  return (
    <WizardStepLayout
      etapeCourante={2}
      totalEtapes={4}
      titre={pourQui === 'TIERS' ? m.wizard_situation_title_other() : m.wizard_situation_title_self()}
      onRetour={() => navigate({ to: '/recommandation/pour-qui' })}
      onSuivant={() => navigate({ to: '/recommandation/frequence' })}
      suivantDesactive={!situation}
      layout="grid"
    >
      {SITUATIONS.map((item) => (
        <ChoiceCard
          key={item.value}
          label={SITUATION_LABELS[item.value]?.() ?? item.label}
          description={SITUATION_DESCRIPTIONS[item.value]?.()}
          icon={item.icon}
          selected={situation === item.value}
          onSelect={() => dispatch(situationDefinie({ situation: item.value }))}
        />
      ))}

      {situation === 'ETUDIANT' ? (
        <label className="col-span-full flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
          <span className="font-sans text-base font-semibold text-dark">{pourQui === 'TIERS' ? m.wizard_situation_boursier_other() : m.wizard_situation_boursier_self()}</span>
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
