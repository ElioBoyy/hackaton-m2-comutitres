import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Gift } from 'lucide-react'
import { WizardStepLayout } from '~/components/ui/WizardStepLayout'
import { DEPARTEMENTS_HORS_IDF, DEPARTEMENTS_IDF, getDepartement } from '~/domain/residence'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSelectionne, residenceDefinie } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/residence')({
  component: ResidenceStep,
})

function ResidenceStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pourQui = useAppSelector((state) => state.wizard.pourQui)
  const residence = useAppSelector((state) => state.wizard.residence)

  const dept = getDepartement(residence.departement)

  function handleChange(code: string) {
    const d = getDepartement(code)
    if (!d) return
    dispatch(residenceDefinie({ departement: code, resideEnIledeFrance: d.resideEnIledeFrance }))
    if (!d.resideEnIledeFrance) {
      dispatch(abonnementSelectionne('NAVIGO_LIBERTE_PLUS'))
      navigate({ to: '/recommandation/resultat' })
    }
  }

  return (
    <WizardStepLayout
      etapeCourante={4}
      totalEtapes={4}
      titre={pourQui === 'TIERS' ? m.wizard_residence_title_other() : m.wizard_residence_title_self()}
      onRetour={() => navigate({ to: '/recommandation/frequence' })}
      onSuivant={() => navigate({ to: '/recommandation/resultat' })}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Département de résidence</span>
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-dark"
          value={residence.departement}
          onChange={(e) => handleChange(e.target.value)}
        >
          <optgroup label="Île-de-France">
            {DEPARTEMENTS_IDF.map((d) => (
              <option key={d.code} value={d.code}>{d.nom}</option>
            ))}
          </optgroup>
          <optgroup label="Hors Île-de-France">
            {DEPARTEMENTS_HORS_IDF.map((d) => (
              <option key={d.code} value={d.code}>{d.nom}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {dept?.aides && dept.aides.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-blue-pale p-4">
          <div className="flex items-center gap-2">
            <Gift size={16} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary">
              Réductions disponibles dans votre département
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {dept.aides.map((aide) => (
              <li key={aide.titre} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-dark">{aide.titre}</span>
                <span className="text-xs text-gray-700">{aide.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dept && !dept.resideEnIledeFrance && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-pale p-3 text-sm text-dark">
          <span>
            {pourQui === 'TIERS' ? m.wizard_residence_outside_idf_info_other() : m.wizard_residence_outside_idf_info_self()}
          </span>
        </div>
      )}
    </WizardStepLayout>
  )
}
