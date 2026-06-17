import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/Button'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { infosTiersDefinies } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/infos-tiers')({
  component: InfosTiersStep,
})

function InfosTiersStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const infosTiers = useAppSelector((state) => state.wizard.infosTiers)

  const complet = Boolean(infosTiers.prenom && infosTiers.nom)

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">
        Pour qui faites-vous cette demande ?
      </h1>
      <p className="text-gray-700">
        Indiquez les informations du bénéficiaire de l'abonnement.
      </p>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Prénom
        <input
          type="text"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-dark"
          value={infosTiers.prenom}
          onChange={(event) =>
            dispatch(infosTiersDefinies({ ...infosTiers, prenom: event.target.value }))
          }
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Nom
        <input
          type="text"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-dark"
          value={infosTiers.nom}
          onChange={(event) =>
            dispatch(infosTiersDefinies({ ...infosTiers, nom: event.target.value }))
          }
        />
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate({ to: '/recommandation/detail' })}>
          Retour
        </Button>
        <Button
          onClick={() => navigate({ to: '/recommandation/pieces' })}
          disabled={!complet}
          className="flex-1"
        >
          Suivant
        </Button>
      </div>
    </main>
  )
}
