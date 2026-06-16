import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Building2, CreditCard } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/Button'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { piecesSontCompletes } from '~/domain/pieces'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, paiementValide } from '~/store/wizardSlice'

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
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          Reprendre le questionnaire
        </Button>
      </main>
    )
  }

  if (!piecesSontCompletes(wizard)) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 py-12 text-center">
        <p className="text-gray-700">
          Il manque des pièces obligatoires à votre dossier. Complétez-le
          avant de procéder au paiement.
        </p>
        <Button onClick={() => navigate({ to: '/recommandation/pieces' })}>
          Compléter le dossier
        </Button>
      </main>
    )
  }

  const { abonnement } = selectionnerAbonnement(resultat, wizard.abonnementSelectionneId)

  function confirmerPaiement() {
    dispatch(paiementValide())
    dispatch(abonnementSauvegarde(abonnement.id))
    navigate({ to: '/dashboard' })
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">Paiement</h1>
      <p className="text-gray-700">
        {abonnement.nom} — {abonnement.prixAnnuelEuros.toFixed(2)} € / an
      </p>

      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard
          icon={CreditCard}
          label="Carte bancaire"
          selected={moyenPaiement === 'CB'}
          onSelect={() => setMoyenPaiement('CB')}
        />
        <ChoiceCard
          icon={Building2}
          label="Mandat SEPA"
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

      <div className="mt-2 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate({ to: '/recommandation/recapitulatif' })}>
          Retour
        </Button>
        <Button
          onClick={confirmerPaiement}
          disabled={
            !moyenPaiement ||
            (moyenPaiement === 'CB' && !carteBancaireComplete) ||
            (moyenPaiement === 'SEPA' && !mandatSepaConsenti)
          }
          className="flex-1"
        >
          Confirmer le paiement
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
        label="Nom du titulaire"
        placeholder="Jean Dupont"
        value={valeurs.nom}
        onChange={(nom) => onChange({ ...valeurs, nom })}
      />
      <ChampTexte
        label="Numéro de carte"
        placeholder="4242 4242 4242 4242"
        value={valeurs.numero}
        onChange={(numero) => onChange({ ...valeurs, numero })}
      />
      <div className="grid grid-cols-2 gap-3">
        <ChampTexte
          label="Date d'expiration"
          placeholder="MM/AA"
          value={valeurs.expiration}
          onChange={(expiration) => onChange({ ...valeurs, expiration })}
        />
        <ChampTexte
          label="CVC"
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
          Référence unique du mandat (RUM)
          <span className="block font-mono font-semibold text-dark">{rum}</span>
        </p>
        <p>
          Identifiant créancier SEPA (ICS)
          <span className="block font-mono font-semibold text-dark">{ICS_CREANCIER}</span>
        </p>
      </div>

      <ChampTexte label="Nom du titulaire du compte" placeholder="Jean Dupont" />
      <ChampTexte label="IBAN" placeholder="FR76 1234 5678 9012 3456 7890 123" />
      <ChampTexte label="BIC" placeholder="BNPAFRPPXXX" />

      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          checked={consenti}
          onChange={(event) => onConsentementChange(event.target.checked)}
        />
        <span className="text-xs text-gray-700">
          En signant ce mandat, j'autorise Comutitres à envoyer des
          instructions à ma banque pour débiter mon compte, et ma banque à
          débiter mon compte conformément aux instructions de Comutitres. Je
          bénéficie d'un droit à remboursement par ma banque selon les
          conditions décrites dans la convention que j'ai passée avec elle.
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
