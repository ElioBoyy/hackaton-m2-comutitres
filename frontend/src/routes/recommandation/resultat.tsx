import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PiggyBank } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/Button'
import { ScoreBadge } from '~/components/ui/ScoreBadge'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, abonnementSelectionne } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/resultat')({
  component: ResultatStep,
})

function ResultatStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
      <main className="mx-auto flex max-w-md flex-col gap-4 py-12 text-center">
        <p className="text-gray-700">
          Merci de répondre au questionnaire avant de consulter votre résultat.
        </p>
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          Reprendre le questionnaire
        </Button>
      </main>
    )
  }

  const { economieAnnuelleEuros } = resultat
  const selectionne = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)
  const estRecommandePrincipal =
    selectionne.abonnement.id === resultat.recommandePrincipal.abonnement.id
  const autresOptions = [resultat.recommandePrincipal, ...resultat.autresOptions].filter(
    (item) => item.abonnement.id !== selectionne.abonnement.id,
  )

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">Résultat principal</h1>

      <div className="ticket-card">
        <div className="ticket-card__band justify-between">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            {estRecommandePrincipal ? 'Recommandation' : 'Votre sélection'}
          </span>
          <span className="font-mono text-xs">IDF · 1—5</span>
        </div>
        <div className="ticket-card__body flex flex-col gap-3">
          <p className="text-sm text-gray-700">
            {estRecommandePrincipal ? 'Votre abonnement idéal' : 'Abonnement choisi'}
          </p>
          <h2 className="font-heading text-xl font-bold text-dark">
            {selectionne.abonnement.nom}
          </h2>
          <p className="text-sm text-gray-700">{selectionne.abonnement.zones}</p>
          <p className="font-mono text-2xl font-bold text-dark">
            {selectionne.abonnement.prixAnnuelEuros.toFixed(2)} € / an
          </p>
          <p className="text-sm text-gray-700">
            Soit {(selectionne.abonnement.prixAnnuelEuros / 12).toFixed(2)} € / mois
          </p>
          <ul className="flex flex-col gap-1.5 border-t-2 border-dashed border-gray-300 pt-3 text-sm text-dark">
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-success text-[10px] font-bold text-success">
                ✓
              </span>
              Le plus économique pour vos trajets
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-success text-[10px] font-bold text-success">
                ✓
              </span>
              Valable sur tout le réseau Île-de-France
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-success text-[10px] font-bold text-success">
                ✓
              </span>
              Adapté à votre profil et vos droits
            </li>
          </ul>
        </div>
      </div>

      {estRecommandePrincipal && economieAnnuelleEuros > 0 ? (
        <div className="flex items-start gap-3 border-2 border-dashed border-success p-4 text-sm">
          <PiggyBank className="h-6 w-6 shrink-0 text-success" strokeWidth={1.75} />
          <div>
            <p className="font-mono font-semibold text-success">
              Vous économisez {economieAnnuelleEuros.toFixed(0)} € / an
            </p>
            <p className="text-gray-700">par rapport aux autres options</p>
          </div>
        </div>
      ) : null}

      <h2 className="font-heading text-lg font-bold tracking-tight text-dark">Autres options possibles</h2>
      <p className="text-sm text-gray-700">Cliquez sur une option pour la choisir à la place.</p>
      <div className="flex flex-col gap-3">
        {autresOptions.map(({ abonnement, scoreAdaptation }) => (
          <button
            key={abonnement.id}
            type="button"
            onClick={() => dispatch(abonnementSelectionne(abonnement.id))}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-gray-300 p-4 text-left transition-colors hover:border-primary-light hover:bg-blue-pale"
          >
            <div>
              <p className="font-semibold text-dark">{abonnement.nom}</p>
              <p className="text-sm text-gray-700">{abonnement.zones}</p>
              <p className="font-mono text-sm text-gray-700">
                {abonnement.prixAnnuelEuros.toFixed(2)} € / an
              </p>
            </div>
            <ScoreBadge scoreAdaptation={scoreAdaptation} />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={() => navigate({ to: '/recommandation/detail' })}>
          Souscrire à cet abonnement
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch(abonnementSauvegarde(selectionne.abonnement.id))
            navigate({ to: '/dashboard' })
          }}
        >
          Sauvegarder et quitter
        </Button>
      </div>
    </main>
  )
}
