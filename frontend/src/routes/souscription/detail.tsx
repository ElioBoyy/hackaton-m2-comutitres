import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/components/Button'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { ProgressBar } from '~/components/ui/ProgressBar'
import { TransportBadges, ZoneBadges } from '~/components/TransportZoneBadges'
import { POUR_QUI } from '~/domain/pourQui'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { getAbonnements, type TypeAbonnement } from '~/lib/api'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { boursierDefini, pourQuiDefini, situationDefinie } from '~/store/wizardSlice'
import type { Situation } from '~/domain/situation'

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

/**
 * Mapping code abonnement -> situation deduite. Sert a forcer la bonne situation
 * dans le wizard quand le user arrive en flux direct (sans questionnaire). La
 * page /souscription/pieces utilise ensuite cette situation pour exposer les
 * bons documents (CERTIFICAT_SCOLARITE pour ETUDIANT, etc.).
 */
function deduireSituation(code: string): Situation {
  if (code.startsWith('IMAGINE_R_') || code === 'TRANSPORT_SCOLAIRE') return 'ETUDIANT'
  if (code === 'NAVIGO_SENIOR' || code === 'AMETHYSTE') return 'RETRAITE'
  return 'AUTRE'
}

function DetailDepuisTypeAbonnement({
  abo, onContinue, onRetour,
}: {
  abo: TypeAbonnement
  onContinue: (choix: { pourQui: 'MOI' | 'TIERS'; boursier: boolean }) => void
  onRetour: () => void
}) {
  const { value, suffix } = formatPrixParts(abo)
  const situationDeduite = deduireSituation(abo.code)
  // Boursier proposé pour les profils étudiants (Imagine R, Transport scolaire).
  const peutEtreBoursier = situationDeduite === 'ETUDIANT'
  const [pourQui, setPourQui] = React.useState<'MOI' | 'TIERS' | null>(null)
  const [boursier, setBoursier] = React.useState(false)

  // Prix mensuel calcule si periodicite annuelle, pour une lecture rapide.
  const prixMensuel = abo.tarifPlein !== null && abo.periodicite === 'annuelle'
    ? (Number(abo.tarifPlein) / 12).toFixed(2) + ' € / mois'
    : null

  const avantages: string[] = []
  if (abo.transports?.length) avantages.push(`${abo.transports.length} mode${abo.transports.length > 1 ? 's' : ''} de transport`)
  if (abo.zones?.length) avantages.push(`Zones ${abo.zones.join(', ')}`)
  if (abo.periodicite === 'annuelle') avantages.push('Engagement annuel, voyages illimités')
  else if (abo.periodicite === 'mensuelle') avantages.push('Mensuel, sans engagement')
  else if (abo.periodicite === 'hebdomadaire') avantages.push('Hebdo, du lundi au dimanche')

  const peutContinuer = pourQui !== null

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

      {/* Ticket-card style /recommandation/resultat : bandeau + zones, libelle,
          description, badges transports/zones, prix annuel + mensuel + avantages. */}
      <div className="ticket-card">
        <div className="ticket-card__band justify-between">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            {m.wizard_detail_selection()}
          </span>
          <span className="font-mono text-xs">{abo.zones.join(' · ') || '—'}</span>
        </div>
        <div className="ticket-card__body flex flex-col gap-4">
          <h2 className="font-heading text-xl font-bold text-dark">{abo.libelle}</h2>

          {abo.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{abo.description}</p>
          )}

          <TransportBadges transports={abo.transports} />
          <ZoneBadges zones={abo.zones} />

          <div className="flex items-baseline gap-1.5 border-t-2 border-dashed border-gray-300 pt-3">
            <span className="font-heading text-2xl font-bold text-primary">{value}</span>
            {suffix && <span className="text-base font-semibold text-dark">{suffix}</span>}
          </div>
          {prixMensuel && (
            <p className="-mt-2 text-sm text-gray-700">{m.wizard_detail_price_monthly_prefix()} {prixMensuel}</p>
          )}

          {avantages.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm text-dark">
              {avantages.map((adv) => (
                <li key={adv} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-success text-[10px] font-bold text-success">
                    ✓
                  </span>
                  {adv}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* "Pour qui ?" : meme pattern (ChoiceCard grid) que /recommandation/pour-qui. */}
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold text-dark">{m.wizard_pour_qui_title()}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {POUR_QUI.map((item) => {
            const label = item.value === 'MOI' ? m.wizard_pour_qui_moi() : m.wizard_pour_qui_tiers()
            const description = item.value === 'TIERS' ? m.wizard_pour_qui_tiers_description() : undefined
            return (
              <ChoiceCard
                key={item.value}
                label={label}
                description={description}
                icon={item.icon}
                selected={pourQui === item.value}
                onSelect={() => setPourQui(item.value)}
              />
            )
          })}
        </div>
      </div>

      {/* Toggle boursier (checkbox style /recommandation/situation) visible
          uniquement pour les profils etudiants. */}
      {peutEtreBoursier && (
        <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
          <span className="font-sans text-base font-semibold text-dark">
            {pourQui === 'TIERS' ? m.wizard_situation_boursier_other() : m.wizard_situation_boursier_self()}
          </span>
          <input
            type="checkbox"
            className="h-6 w-6 accent-primary"
            checked={boursier}
            onChange={(event) => setBoursier(event.target.checked)}
          />
        </label>
      )}

      <Button
        disabled={!peutContinuer}
        onClick={() => peutContinuer && onContinue({ pourQui: pourQui!, boursier: peutEtreBoursier && boursier })}
      >
        {m.wizard_detail_continue()}
      </Button>
    </main>
  )
}

function DetailStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
          onContinue={({ pourQui, boursier }) => {
            // Propage la situation deduite + boursier + pourQui dans le wizard
            // pour que /souscription/pieces affiche les bons documents
            // (CERTIFICAT_SCOLARITE si ETUDIANT, NOTIFICATION_BOURSE si boursier).
            const situation = deduireSituation(aboDirecte.code)
            dispatch(situationDefinie({ situation }))
            dispatch(boursierDefini(boursier))
            dispatch(pourQuiDefini(pourQui))
            navigate({
              to: pourQui === 'TIERS' ? '/souscription/infos-tiers' : '/souscription/pieces',
              search: { code },
            })
          }}
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
