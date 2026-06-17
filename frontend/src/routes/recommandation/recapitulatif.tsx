import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GraduationCap, IdCard, MapPin, Receipt, Sparkles, Ticket, User, Users } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/Button'
import { ApiError } from '~/lib/api'
import { isAuthenticated } from '~/lib/auth'
import { construirePayloadDossier, creerDossier } from '~/lib/dossier'
import { piecesSontCompletes } from '~/domain/pieces'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { SITUATIONS } from '~/domain/situation'
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
      <main className="mx-auto flex max-w-md flex-col gap-4 py-12 text-center">
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          Reprendre le questionnaire
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
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">Récapitulatif</h1>
        <button
          type="button"
          className="text-sm font-medium tracking-wide text-primary uppercase underline"
          onClick={() => navigate({ to: '/recommandation/pour-qui' })}
        >
          Modifier
        </button>
      </div>

      <dl className="ticket-card">
        <div className="ticket-card__band">
          <span className="font-mono text-xs font-semibold tracking-[0.15em] uppercase">
            Souche de profil
          </span>
        </div>
        <div className="ticket-card__body flex flex-col gap-3">
          <Champ
            icon={Users}
            titre="Demande pour"
            valeur={wizard.pourQui === 'TIERS' ? 'Un tiers' : 'Moi-même'}
          />
          {wizard.pourQui === 'TIERS' ? (
            <Champ
              icon={Users}
              titre="Bénéficiaire"
              valeur={`${wizard.infosTiers.prenom} ${wizard.infosTiers.nom}`.trim()}
            />
          ) : null}
          <Champ icon={User} titre="Situation" valeur={situationLabel ?? ''} />
          <Champ icon={MapPin} titre="Zones" valeur={abonnement.zones.replace('Zones ', '')} />
          <Champ icon={Ticket} titre="Abonnement choisi" valeur={abonnement.nom} />
          <Champ
            icon={IdCard}
            titre="Pièce d'identité"
            valeur={wizard.pieceIdentiteNomFichier ?? 'Non fournie'}
          />
          {wizard.situation === 'ETUDIANT' ? (
            <Champ
              icon={GraduationCap}
              titre="Certificat de scolarité"
              valeur={wizard.justificatifEtudiantNomFichier ?? 'Non fourni'}
            />
          ) : null}
          {wizard.situation === 'ETUDIANT' ? (
            <Champ icon={Receipt} titre="Boursier" valeur={wizard.boursier ? 'Oui' : 'Non'} />
          ) : null}
          {wizard.situation === 'ETUDIANT' && wizard.boursier ? (
            <Champ
              icon={Receipt}
              titre="Notification de bourse"
              valeur={wizard.notificationBourseNomFichier ?? 'Non fournie'}
            />
          ) : null}
          <Champ
            icon={Sparkles}
            titre="Pré-vérification IA"
            valeur={wizard.verificationIA === 'EFFECTUEE' ? 'Effectuée' : 'Non demandée'}
          />
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate({ to: '/recommandation/paiement' })}
          disabled={!piecesCompletes}
        >
          Procéder au paiement
        </Button>
        {!piecesCompletes ? (
          <p className="text-center text-xs text-gray-700">
            Il manque la pièce d'identité{wizard.situation === 'ETUDIANT' ? ' et/ou le certificat de scolarité' : ''}{' '}
            pour pouvoir procéder au paiement.{' '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => navigate({ to: '/recommandation/pieces' })}
            >
              Compléter le dossier
            </button>
          </p>
        ) : null}
        {erreur ? (
          <div className="rounded-lg bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger">
            {erreur.type === 'non-authentifie' ? (
              <>
                Vous devez être connecté pour sauvegarder votre demande.{' '}
                <Link to="/login" className="font-medium underline">
                  Se connecter
                </Link>
              </>
            ) : (
              erreur.message
            )}
          </div>
        ) : null}
        <Button variant="secondary" onClick={sauvegarderEtQuitter} disabled={envoiEnCours}>
          {envoiEnCours ? 'Enregistrement...' : 'Sauvegarder et quitter'}
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
