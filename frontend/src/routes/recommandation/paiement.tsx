import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Building2, CreditCard } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/Button'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { ApiError } from '~/lib/api'
import { isAuthenticated } from '~/lib/auth'
import { construirePayloadDossier, creerDossier } from '~/lib/dossier'
import { piecesSontCompletes } from '~/domain/pieces'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, dossierBackendDefini, paiementValide } from '~/store/wizardSlice'

// Erreur d'envoi du dossier : distingue le cas "pas connecte" (lien vers
// /login) des autres erreurs (message brut de l'API ou reseau).
type ErreurPaiement = { type: 'non-authentifie' } | { type: 'autre'; message: string }

export const Route = createFileRoute('/recommandation/paiement')({
  component: PaiementStep,
})

type MoyenPaiement = 'CB' | 'SEPA'

function PaiementStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.wizard)
  const [moyenPaiement, setMoyenPaiement] = React.useState<MoyenPaiement | null>(null)
  const [mandatSepaConsenti, setMandatSepaConsenti] = React.useState(false)
  const [carteBancaire, setCarteBancaire] = React.useState({
    nom: '',
    numero: '',
    expiration: '',
    cvc: '',
  })
  const carteBancaireComplete = Object.values(carteBancaire).every((champ) => champ.trim() !== '')
  const [envoiEnCours, setEnvoiEnCours] = React.useState(false)
  const [erreur, setErreur] = React.useState<ErreurPaiement | null>(null)

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
          {m.wizard_resume_questionnaire()}
        </Button>
      </main>
    )
  }

  if (!piecesSontCompletes(wizard)) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
        <p className="text-gray-700">
          {m.wizard_paiement_missing()}
        </p>
        <Button onClick={() => navigate({ to: '/recommandation/pieces' })}>
          {m.wizard_paiement_complete()}
        </Button>
      </main>
    )
  }

  const { abonnement } = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)

  async function confirmerPaiement() {
    if (!moyenPaiement) return

    if (!isAuthenticated()) {
      setErreur({ type: 'non-authentifie' })
      return
    }

    setErreur(null)
    setEnvoiEnCours(true)
    try {
      // idDossierExistant (porte par construirePayloadDossier via
      // wizard.idDossierBackend) complete un brouillon deja sauvegarde
      // (resultat/recapitulatif) au lieu d'en creer un nouveau dossier.
      const reponse = await creerDossier(construirePayloadDossier(wizard, abonnement.id, moyenPaiement))
      dispatch(dossierBackendDefini(reponse.idDossier))
      dispatch(paiementValide())
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
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{m.wizard_paiement_title()}</h1>
      <p className="text-gray-700">
        {abonnement.nom} — {abonnement.prixAnnuelEuros.toFixed(2)} € / an
      </p>

      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard
          icon={CreditCard}
          label={m.wizard_paiement_cb()}
          selected={moyenPaiement === 'CB'}
          onSelect={() => setMoyenPaiement('CB')}
        />
        <ChoiceCard
          icon={Building2}
          label={m.wizard_paiement_sepa()}
          selected={moyenPaiement === 'SEPA'}
          onSelect={() => setMoyenPaiement('SEPA')}
        />
      </div>

      {moyenPaiement === 'CB' ? (
        <FormulaireCarteBancaire valeurs={carteBancaire} onChange={setCarteBancaire} />
      ) : null}
      {moyenPaiement === 'SEPA' ? (
        <FormulaireMandatSepa
          consenti={mandatSepaConsenti}
          onConsentementChange={setMandatSepaConsenti}
        />
      ) : null}

      {erreur ? (
        <div className="rounded-lg bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger">
          {erreur.type === 'non-authentifie' ? (
            <>
              {m.wizard_not_connected_pay()}{' '}
              <Link to="/login" className="font-medium underline">
                {m.wizard_not_connected_login()}
              </Link>
            </>
          ) : (
            erreur.message
          )}
        </div>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate({ to: '/recommandation/recapitulatif' })}>
          {m.common_back()}
        </Button>
        <Button
          onClick={confirmerPaiement}
          disabled={
            envoiEnCours ||
            !moyenPaiement ||
            (moyenPaiement === 'CB' && !carteBancaireComplete) ||
            (moyenPaiement === 'SEPA' && !mandatSepaConsenti)
          }
          className="flex-1"
        >
          {envoiEnCours ? m.wizard_paiement_confirming() : m.wizard_paiement_confirm()}
        </Button>
      </div>
    </main>
  )
}

interface CarteBancaire {
  nom: string
  numero: string
  expiration: string
  cvc: string
}

function FormulaireCarteBancaire({
  valeurs,
  onChange,
}: {
  valeurs: CarteBancaire
  onChange: (valeurs: CarteBancaire) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <ChampTexte
        label={m.wizard_paiement_cb_holder()}
        placeholder="Jean Dupont"
        value={valeurs.nom}
        onChange={(nom) => onChange({ ...valeurs, nom })}
      />
      <ChampTexte
        label={m.wizard_paiement_cb_number()}
        placeholder="4242 4242 4242 4242"
        value={valeurs.numero}
        onChange={(numero) => onChange({ ...valeurs, numero })}
      />
      <div className="grid grid-cols-2 gap-3">
        <ChampTexte
          label={m.wizard_paiement_cb_expiry()}
          placeholder="MM/AA"
          value={valeurs.expiration}
          onChange={(expiration) => onChange({ ...valeurs, expiration })}
        />
        <ChampTexte
          label={m.wizard_paiement_cb_cvc()}
          placeholder="123"
          value={valeurs.cvc}
          onChange={(cvc) => onChange({ ...valeurs, cvc })}
        />
      </div>
    </div>
  )
}

// RUM (Reference Unique de Mandat) et ICS (Identifiant Createur SEPA) :
// mentions obligatoires sur un mandat de prelevement SEPA, cf. reponse a
// l'utilisateur. Mock pour cette iteration, generes/statiques.
const ICS_CREANCIER = 'FR00ZZZ123456'

function FormulaireMandatSepa({
  consenti,
  onConsentementChange,
}: {
  consenti: boolean
  onConsentementChange: (consenti: boolean) => void
}) {
  const rum = React.useId().replace(/:/g, '')

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
        <p>
          {m.wizard_paiement_sepa_rum()}
          <span className="block font-mono font-semibold text-dark">{rum}</span>
        </p>
        <p>
          {m.wizard_paiement_sepa_ics()}
          <span className="block font-mono font-semibold text-dark">{ICS_CREANCIER}</span>
        </p>
      </div>

      <ChampTexte label={m.wizard_paiement_sepa_holder()} placeholder="Jean Dupont" />
      <ChampTexte label={m.wizard_paiement_sepa_iban()} placeholder="FR76 1234 5678 9012 3456 7890 123" />
      <ChampTexte label={m.wizard_paiement_sepa_bic()} placeholder="BNPAFRPPXXX" />

      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          checked={consenti}
          onChange={(event) => onConsentementChange(event.target.checked)}
        />
        <span className="text-xs text-gray-700">
          {m.wizard_paiement_sepa_consent()}
        </span>
      </label>
    </div>
  )
}

function ChampTexte({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-dark"
      />
    </label>
  )
}
