import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { Button } from '~/components/Button'
import { InfosTiersSchema } from '~/lib/schemas'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { infosTiersDefinies } from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/infos-tiers')({
  component: InfosTiersStep,
})

function translateValidation(key: string): string {
  const messages = m as unknown as Record<string, () => string>
  return typeof messages[key] === 'function' ? messages[key]() : key
}

function InfosTiersStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const infosTiers = useAppSelector((state) => state.wizard.infosTiers)
  const [erreurs, setErreurs] = React.useState<Record<string, string>>({})

  function handleSuivant() {
    const result = InfosTiersSchema.safeParse(infosTiers)
    if (!result.success) {
      const map: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!map[field]) map[field] = translateValidation(issue.message)
      }
      setErreurs(map)
      return
    }
    setErreurs({})
    navigate({ to: '/recommandation/pieces' })
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">
        {m.wizard_infos_tiers_title()}
      </h1>
      <p className="text-gray-700">
        {m.wizard_infos_tiers_subtitle()}
      </p>

      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {m.wizard_infos_tiers_prenom()}
          <input
            type="text"
            className={`rounded-lg border bg-white px-3 py-2 font-sans text-dark ${erreurs.prenom ? 'border-danger' : 'border-gray-300'}`}
            value={infosTiers.prenom}
            onChange={(event) => {
              dispatch(infosTiersDefinies({ ...infosTiers, prenom: event.target.value }))
              if (erreurs.prenom) setErreurs((e) => ({ ...e, prenom: '' }))
            }}
          />
        </label>
        {erreurs.prenom && <p className="text-xs text-danger">{erreurs.prenom}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {m.wizard_infos_tiers_nom()}
          <input
            type="text"
            className={`rounded-lg border bg-white px-3 py-2 font-sans text-dark ${erreurs.nom ? 'border-danger' : 'border-gray-300'}`}
            value={infosTiers.nom}
            onChange={(event) => {
              dispatch(infosTiersDefinies({ ...infosTiers, nom: event.target.value }))
              if (erreurs.nom) setErreurs((e) => ({ ...e, nom: '' }))
            }}
          />
        </label>
        {erreurs.nom && <p className="text-xs text-danger">{erreurs.nom}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate({ to: '/recommandation/detail' })}>
          {m.common_back()}
        </Button>
        <Button onClick={handleSuivant} className="flex-1">
          {m.common_next()}
        </Button>
      </div>
    </main>
  )
}
