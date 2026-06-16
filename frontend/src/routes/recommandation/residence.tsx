import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Info, MapPin } from 'lucide-react'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { REGIONS, type Region } from '~/domain/residence'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { residenceDefinie } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/residence')({
  component: ResidenceStep,
})

const AUTRES_REGIONS = REGIONS.filter((region) => region !== 'Île-de-France')

function ResidenceStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const residence = useAppSelector((state) => state.wizard.residence)
  const vitHorsIDF = !residence.resideEnIledeFrance

  return (
    <WizardStepLayout
      etapeCourante={4}
      totalEtapes={4}
      titre="Où habitez-vous ?"
      onRetour={() => navigate({ to: '/recommandation/frequence' })}
      onSuivant={() => navigate({ to: '/recommandation/resultat' })}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Région</span>
        {vitHorsIDF ? (
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-dark"
            value={residence.region}
            onChange={(event) =>
              dispatch(residenceDefinie({ ...residence, region: event.target.value as Region }))
            }
          >
            {AUTRES_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <MapPin className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <span className="font-sans font-semibold text-dark">Île-de-France</span>
          </div>
        )}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
        <span className="text-sm font-medium text-dark">
          Je vis en dehors de l'Île-de-France
        </span>
        <input
          type="checkbox"
          checked={vitHorsIDF}
          onChange={(event) => {
            const horsIDF = event.target.checked
            dispatch(
              residenceDefinie({
                region: horsIDF ? AUTRES_REGIONS[0] : 'Île-de-France',
                resideEnIledeFrance: !horsIDF,
              }),
            )
          }}
        />
      </label>

      {vitHorsIDF ? (
        <div className="flex items-start gap-2 rounded-lg bg-blue-pale p-3 text-sm text-dark">
          <Info className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
          <span>
            Bon à savoir : des solutions existent aussi si vous n'habitez pas en
            Île-de-France.
          </span>
        </div>
      ) : null}
    </WizardStepLayout>
  )
}
