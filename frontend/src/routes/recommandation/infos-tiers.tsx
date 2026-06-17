import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/Button'
import { m } from '~/paraglide/messages'
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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">
        {m.wizard_infos_tiers_title()}
      </h1>
      <p className="text-gray-700">
        {m.wizard_infos_tiers_subtitle()}
      </p>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {m.wizard_infos_tiers_prenom()}
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
        {m.wizard_infos_tiers_nom()}
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
        <Button variant="ghost" onClick={() => navigate({ to: '/recommandation/detail' })}>
          {m.common_back()}
        </Button>
        <Button
          onClick={() => navigate({ to: '/recommandation/pieces' })}
          disabled={!complet}
          className="flex-1"
        >
          {m.common_next()}
        </Button>
      </div>
    </main>
  )
}
