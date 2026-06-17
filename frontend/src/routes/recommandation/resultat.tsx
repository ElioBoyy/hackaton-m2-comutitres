import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PiggyBank } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/Button'
import { ScoreBadge } from '~/components/ui/ScoreBadge'
import { ApiError } from '~/lib/api'
import { isAuthenticated } from '~/lib/auth'
import { construirePayloadDossier, creerDossier } from '~/lib/dossier'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, abonnementSelectionne, dossierBackendDefini } from '~/store/wizardSlice'

// Erreur d'enregistrement du brouillon : distingue "pas connecte" (lien vers
// /login) des autres erreurs (message brut de l'API ou reseau).
type ErreurSauvegarde = { type: 'non-authentifie' } | { type: 'autre'; message: string }

export const Route = createFileRoute('/recommandation/resultat')({
  component: ResultatStep,
})

function ResultatStep() {
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

  if (!resultat) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
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

  async function sauvegarderEtQuitter() {
    if (!isAuthenticated()) {
      setErreur({ type: 'non-authentifie' })
      return
    }
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      // Pas de modePaiement : le dossier est sauvegarde en brouillon
      // (statut EN_ATTENTE_PAIEMENT, cf. CONTEXT.md / CreerDossier). Les
      // pieces n'ont pas encore ete collectees a ce stade du parcours.
      // idDossierExistant (porte par construirePayloadDossier via
      // wizard.idDossierBackend) complete un brouillon deja sauvegarde au
      // lieu d'en creer un nouveau.
      const reponse = await creerDossier(construirePayloadDossier(wizard, selectionne.abonnement.id))
      dispatch(dossierBackendDefini(reponse.idDossier))
      dispatch(abonnementSauvegarde(selectionne.abonnement.id))
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

      <div className="flex flex-col gap-3">
        <Button onClick={() => navigate({ to: '/recommandation/detail' })}>
          Souscrire à cet abonnement
        </Button>
        <Button variant="ghost" onClick={sauvegarderEtQuitter} disabled={envoiEnCours}>
          {envoiEnCours ? 'Enregistrement...' : 'Sauvegarder et quitter'}
        </Button>
      </div>
    </main>
  )
}
