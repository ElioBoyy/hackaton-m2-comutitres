import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GraduationCap, IdCard, MapPin, Receipt, Sparkles, Ticket, User, Users } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/Button'
import { ApiError } from '~/lib/api'
import { isAuthenticated } from '~/lib/auth'
import { construirePayloadDossier, creerDossier } from '~/lib/dossier'
import { piecesSontCompletes } from '~/domain/pieces'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { SITUATIONS } from '~/domain/situation'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, dossierBackendDefini } from '~/store/wizardSlice'

// Erreur d'enregistrement du brouillon : distingue "pas connecte" (lien vers
// /login) des autres erreurs (message brut de l'API ou reseau).
type ErreurSauvegarde = { type: 'non-authentifie' } | { type: 'autre'; message: string }

export const Route = createFileRoute('/recommandation/recapitulatif')({
  component: RecapitulatifStep,
})

function RecapitulatifStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.wizard)
  const [envoiEnCours, setEnvoiEnCours] = React.useState(false)
  const [erreur, setErreur] = React.useState<ErreurSauvegarde | null>(null)

  const resultat = React.useMemo(() => {
    if (!wizard.situation || !wizard.frequenceDeplacement) return null
    return calculerRecommandation({
      situation: wizard.situation,
      frequenceDeplacement: wizard.frequenceDeplacement,
      residence: wizard.residence,
    })
  }, [wizard])

  if (!resultat || !wizard.situation) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          {m.wizard_resume_questionnaire()}
        </Button>
      </main>
    )
  }

  const situationLabel = SITUATIONS.find((item) => item.value === wizard.situation)?.label
  const { abonnement } = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)
  const piecesCompletes = piecesSontCompletes(wizard)

  async function sauvegarderEtQuitter() {
    if (!isAuthenticated()) {
      setErreur({ type: 'non-authentifie' })
      return
    }
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      // Pas de modePaiement : le dossier est sauvegarde en brouillon
      // (statut EN_ATTENTE_PAIEMENT, cf. CONTEXT.md / CreerDossier).
      // idDossierExistant (porte par construirePayloadDossier via
      // wizard.idDossierBackend) complete un brouillon deja sauvegarde au
      // lieu d'en creer un nouveau.
      const reponse = await creerDossier(construirePayloadDossier(wizard, abonnement.id))
      dispatch(dossierBackendDefini(reponse.idDossier))
      dispatch(abonnementSauvegarde(abonnement.id))
      navigate({ to: '/dashboard' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setErreur({ type: 'non-authentifie' })
      } else if (err instanceof ApiError) {
        setErreur({ type: 'autre', message: err.message })
      } else {
        setErreur({ type: 'autre', message: 'Impossible de joindre le serveur. Réessayez.' })
      }
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{m.wizard_recap_title()}</h1>
        <button
          type="button"
          className="text-sm font-medium tracking-wide text-primary uppercase underline"
          onClick={() => navigate({ to: '/recommandation/pour-qui' })}
        >
          {m.wizard_recap_modify()}
        </button>
      </div>

      <dl className="ticket-card">
        <div className="ticket-card__band">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            {m.wizard_recap_profile_label()}
          </span>
        </div>
        <div className="ticket-card__body flex flex-col gap-3">
          <Champ
            icon={Users}
            titre={m.wizard_recap_demand_for()}
            valeur={wizard.pourQui === 'TIERS' ? m.wizard_recap_third_party() : m.wizard_recap_myself()}
          />
          {wizard.pourQui === 'TIERS' ? (
            <Champ
              icon={Users}
              titre={m.wizard_recap_beneficiary()}
              valeur={`${wizard.infosTiers.prenom} ${wizard.infosTiers.nom}`.trim()}
            />
          ) : null}
          <Champ icon={User} titre={m.wizard_recap_situation()} valeur={situationLabel ?? ''} />
          <Champ icon={MapPin} titre={m.wizard_recap_zones()} valeur={abonnement.zones.replace('Zones ', '')} />
          <Champ icon={Ticket} titre={m.wizard_recap_subscription()} valeur={abonnement.nom} />
          <Champ
            icon={IdCard}
            titre={m.wizard_recap_id_card()}
            valeur={wizard.pieceIdentiteNomFichier ?? 'Non fournie'}
          />
          {wizard.situation === 'ETUDIANT' ? (
            <Champ
              icon={GraduationCap}
              titre={m.wizard_recap_school_cert()}
              valeur={wizard.justificatifEtudiantNomFichier ?? 'Non fourni'}
            />
          ) : null}
          {wizard.situation === 'ETUDIANT' ? (
            <Champ icon={Receipt} titre={m.wizard_recap_boursier()} valeur={wizard.boursier ? m.wizard_recap_boursier_yes() : m.wizard_recap_boursier_no()} />
          ) : null}
          {wizard.situation === 'ETUDIANT' && wizard.boursier ? (
            <Champ
              icon={Receipt}
              titre={m.wizard_recap_scholarship_notif()}
              valeur={wizard.notificationBourseNomFichier ?? 'Non fournie'}
            />
          ) : null}
          <Champ
            icon={Sparkles}
            titre={m.wizard_recap_preverif()}
            valeur={wizard.verificationIA === 'EFFECTUEE' ? m.wizard_recap_preverif_done() : m.wizard_recap_preverif_none()}
          />
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate({ to: '/recommandation/paiement' })}
          disabled={!piecesCompletes}
        >
          {m.wizard_recap_proceed_payment()}
        </Button>
        {!piecesCompletes ? (
          <p className="text-center text-xs text-gray-700">
            {m.wizard_recap_missing_self()}{wizard.situation === 'ETUDIANT' ? m.wizard_recap_missing_and_cert() : ''}
            {m.wizard_recap_missing_suffix()}{' '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => navigate({ to: '/recommandation/pieces' })}
            >
              {m.wizard_recap_complete_dossier()}
            </button>
          </p>
        ) : null}
        {erreur ? (
          <div className="rounded-lg bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger">
            {erreur.type === 'non-authentifie' ? (
              <>
                {m.wizard_recap_not_connected()}{' '}
                <Link to="/login" className="font-medium underline">
                  {m.wizard_not_connected_login()}
                </Link>
              </>
            ) : (
              erreur.message
            )}
          </div>
        ) : null}
        <Button variant="ghost" onClick={sauvegarderEtQuitter} disabled={envoiEnCours}>
          {envoiEnCours ? m.wizard_resultat_saving() : m.wizard_resultat_save_quit()}
        </Button>
      </div>
    </main>
  )
}

function Champ({
  icon: Icon,
  titre,
  valeur,
}: {
  icon: typeof User
  titre: string
  valeur: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-gray-300 pb-2 last:border-0 last:pb-0">
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-gray-700 uppercase">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        {titre}
      </dt>
      <dd className="max-w-[10rem] truncate font-mono font-semibold text-dark" title={valeur}>
        {valeur}
      </dd>
    </div>
  )
}
