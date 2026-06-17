import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Camera, GraduationCap, Receipt } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/Button'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { useAppSelector } from '~/store/hooks'

export const Route = createFileRoute('/recommandation/detail')({
  component: DetailStep,
})

function DetailStep() {
  const navigate = useNavigate()
  const wizard = useAppSelector((state) => state.wizard)

  const resultat = React.useMemo(() => {
    if (!wizard.situation || !wizard.frequenceDeplacement) return null
    return calculerRecommandation({
      situation: wizard.situation,
      frequenceDeplacement: wizard.frequenceDeplacement,
      residence: wizard.residence,
    })
  }, [wizard])

  if (!resultat) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          Reprendre le questionnaire
        </Button>
      </main>
    )
  }

  const { abonnement } = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">Détail de votre recommandation</h1>

      <div className="ticket-card">
        <div className="ticket-card__band">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            {abonnement.zones}
          </span>
        </div>
        <div className="ticket-card__body">
          <h2 className="font-heading text-xl font-bold text-dark">{abonnement.nom}</h2>
          <p className="mt-2 font-mono text-2xl font-bold text-dark">
            {abonnement.prixAnnuelEuros.toFixed(2)} € / an
          </p>
          <p className="text-sm text-gray-700">
            Soit {(abonnement.prixAnnuelEuros / 12).toFixed(2)} € / mois
          </p>

          <h3 className="mt-4 text-xs font-semibold tracking-widest text-gray-700 uppercase">
            Inclus dans votre abonnement
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-dark">
            {abonnement.inclus.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-success text-[10px] font-bold text-success">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-4 text-xs font-semibold tracking-widest text-gray-700 uppercase">
            Documents nécessaires
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
            <Camera className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Photo d'identité
          </p>
          {wizard.situation === 'ETUDIANT' ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
              <GraduationCap className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Certificat de scolarité (année en cours)
            </p>
          ) : null}
          {wizard.situation === 'ETUDIANT' && wizard.boursier ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
              <Receipt className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Notification conditionnelle de bourse
            </p>
          ) : null}
        </div>
      </div>

      <Button
        onClick={() =>
          navigate({
            to: wizard.pourQui === 'TIERS' ? '/recommandation/infos-tiers' : '/recommandation/pieces',
          })
        }
      >
        Continuer
      </Button>
    </main>
  )
}
