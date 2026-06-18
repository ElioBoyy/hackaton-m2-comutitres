import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/components/Button'
import { ProgressBar } from '~/components/ui/ProgressBar'
import { TransportBadges, ZoneBadges } from '~/components/TransportZoneBadges'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { getAbonnements, type TypeAbonnement } from '~/lib/api'
import { m } from '~/paraglide/messages'
import { useAppSelector } from '~/store/hooks'

export const Route = createFileRoute('/souscription/detail')({
  validateSearch: z.object({ code: z.string().optional() }),
  component: DetailStep,
})

function formatPrixParts(abo: TypeAbonnement): { value: string; suffix: string } {
  if (abo.tarifPlein === null) return { value: 'Tarif social', suffix: '' }
  if (abo.tarifPlein === 0) return { value: 'Gratuit', suffix: '' }
  const n = Number(abo.tarifPlein)
  const value = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  switch (abo.periodicite) {
    case 'annuelle':     return { value, suffix: '/ an' }
    case 'mensuelle':    return { value, suffix: '/ mois' }
    case 'hebdomadaire': return { value, suffix: '/ sem.' }
    default:             return { value, suffix: '' }
  }
}

function DetailDepuisTypeAbonnement({ abo, onContinue, onRetour }: { abo: TypeAbonnement; onContinue: () => void; onRetour: () => void }) {
  const { value, suffix } = formatPrixParts(abo)
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <button
        type="button"
        onClick={onRetour}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start"
      >
        <ArrowLeft size={15} />
        Retour
      </button>

      <ProgressBar etapeCourante={1} totalEtapes={4} />
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{m.wizard_detail_title()}</h1>

      <div className="ticket-card">
        <div className="ticket-card__band">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            {abo.zones.join(' · ')}
          </span>
        </div>
        <div className="ticket-card__body flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-dark">{abo.libelle}</h2>

          {abo.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{abo.description}</p>
          )}

          <TransportBadges transports={abo.transports} />
          <ZoneBadges zones={abo.zones} />

          <div className="flex items-baseline gap-1.5 border-t border-gray-100 pt-3">
            <span className="font-heading text-2xl font-bold text-primary">{value}</span>
            {suffix && <span className="text-base font-semibold text-dark">{suffix}</span>}
          </div>
        </div>
      </div>

      <Button onClick={onContinue}>
        {m.wizard_detail_continue()}
      </Button>
    </main>
  )
}

function DetailStep() {
  const navigate = useNavigate()
  const wizard = useAppSelector((state) => state.wizard)
  const { code } = Route.useSearch()
  const [aboDirecte, setAboDirecte] = React.useState<TypeAbonnement | null>(null)
  const [chargement, setChargement] = React.useState(false)

  React.useEffect(() => {
    if (!code) return
    setChargement(true)
    getAbonnements()
      .then((list) => {
        const trouve = list.find((a) => a.code === code) ?? null
        setAboDirecte(trouve)
      })
      .catch(() => setAboDirecte(null))
      .finally(() => setChargement(false))
  }, [code])

  // Chemin direct depuis la page d'accueil (modal "+ d'infos") via ?code=
  if (code) {
    if (chargement) {
      return (
        <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm text-gray-700">Chargement…</p>
        </main>
      )
    }
    if (aboDirecte) {
      return (
        <DetailDepuisTypeAbonnement
          abo={aboDirecte}
          onRetour={() => navigate({ to: '/' })}
          onContinue={() =>
            navigate({
              to: wizard.pourQui === 'TIERS' ? '/souscription/infos-tiers' : '/souscription/pieces',
              search: { code },
            })
          }
        />
      )
    }
  }

  // Chemin via le questionnaire de recommandation
  if (!wizard.situation || !wizard.frequenceDeplacement) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          {m.wizard_resume_questionnaire()}
        </Button>
      </main>
    )
  }

  const resultat = calculerRecommandation({
    situation: wizard.situation,
    frequenceDeplacement: wizard.frequenceDeplacement,
    residence: wizard.residence,
  })

  const { abonnement } = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <button
        type="button"
        onClick={() => navigate({ to: '/recommandation/resultat' })}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start"
      >
        <ArrowLeft size={15} />
        Retour
      </button>
      <ProgressBar etapeCourante={1} totalEtapes={4} />
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{m.wizard_detail_title()}</h1>

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

          <h3 className="mt-4 text-xs font-semibold tracking-widest text-gray-700 uppercase">
            {m.wizard_detail_included()}
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
        </div>
      </div>

      <Button
        onClick={() =>
          navigate({
            to: wizard.pourQui === 'TIERS' ? '/souscription/infos-tiers' : '/souscription/pieces',
          })
        }
      >
        {m.wizard_detail_continue()}
      </Button>
    </main>
  )
}
