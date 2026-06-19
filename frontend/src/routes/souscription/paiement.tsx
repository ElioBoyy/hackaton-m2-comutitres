import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Building2, CreditCard } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/components/Button'
import { ChoiceCard } from '~/components/ui/ChoiceCard'
import { ProgressBar } from '~/components/ui/ProgressBar'
import { ApiError, getAbonnements, type TypeAbonnement } from '~/lib/api'
import { isAuthenticated } from '~/lib/auth'
import { construirePayloadDossier, creerDossier } from '~/lib/dossier'
import { piecesSontCompletes } from '~/domain/pieces'
import { calculerRecommandation, selectionnerAbonnement } from '~/domain/recommendation'
import { useCatalogueAbonnements } from '~/domain/useCatalogueAbonnements'
import { CarteBancaireSchema, MandatSepaSchema } from '~/lib/schemas'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { abonnementSauvegarde, dossierBackendDefini, paiementValide } from '~/store/wizardSlice'

type ErreurPaiement = { type: 'non-authentifie' } | { type: 'pieces-manquantes' } | { type: 'autre'; message: string }
type MoyenPaiement = 'CB' | 'SEPA'

export const Route = createFileRoute('/souscription/paiement')({
  validateSearch: z.object({ code: z.string().optional() }),
  component: PaiementStep,
})

function translateValidation(key: string): string {
  const messages = m as unknown as Record<string, () => string>
  return typeof messages[key] === 'function' ? messages[key]() : key
}

function PaiementStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.wizard)
  const [moyenPaiement, setMoyenPaiement] = React.useState<MoyenPaiement | null>(null)
  const [mandatSepaConsenti, setMandatSepaConsenti] = React.useState(false)
  const [carteBancaire, setCarteBancaire] = React.useState({ nom: '', numero: '', expiration: '', cvc: '' })
  const [mandatSepa, setMandatSepa] = React.useState({ nom: '', iban: '', bic: '' })
  const [erreurs, setErreurs] = React.useState<Record<string, string>>({})
  const [envoiEnCours, setEnvoiEnCours] = React.useState(false)
  const [erreur, setErreur] = React.useState<ErreurPaiement | null>(null)

  const { code } = Route.useSearch()
  const [aboDirecte, setAboDirecte] = React.useState<TypeAbonnement | null>(null)
  const [chargement, setChargement] = React.useState(false)
  React.useEffect(() => {
    if (!code) return
    setChargement(true)
    getAbonnements().then((list) => setAboDirecte(list.find((a) => a.code === code) ?? null)).catch(() => {}).finally(() => setChargement(false))
  }, [code])

  const isDirectPath = !!code
  const catalogue = useCatalogueAbonnements()

  const resultat = React.useMemo(() => {
    if (isDirectPath || !wizard.situation || !wizard.frequenceDeplacement) return null
    if (!catalogue) return null
    return calculerRecommandation(
      {
        situation: wizard.situation,
        frequenceDeplacement: wizard.frequenceDeplacement,
        residence: wizard.residence,
      },
      catalogue,
    )
  }, [isDirectPath, wizard.situation, wizard.frequenceDeplacement, wizard.residence, catalogue])

  if (!isDirectPath && !resultat) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-12 text-center">
        <Button onClick={() => navigate({ to: '/recommandation/pour-qui' })}>
          {m.wizard_resume_questionnaire()}
        </Button>
      </main>
    )
  }

  if (isDirectPath && chargement) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-gray-700">Chargement…</p>
      </main>
    )
  }

  const codeAbonnement = aboDirecte ? aboDirecte.code : (resultat ? selectionnerAbonnement(resultat, wizard.abonnementSelectionneId).abonnement.id : '')
  const nomAbonnement = aboDirecte ? aboDirecte.libelle : (resultat ? selectionnerAbonnement(resultat, wizard.abonnementSelectionneId).abonnement.nom : '')
  const prixAbonnement = aboDirecte ? (aboDirecte.tarifPlein !== null ? `${Number(aboDirecte.tarifPlein).toFixed(2)} €` : 'Tarif social') : (resultat ? `${selectionnerAbonnement(resultat, wizard.abonnementSelectionneId).abonnement.prixAnnuelEuros.toFixed(2)} €` : '')

  function validerFormulaire(): boolean {
    if (!moyenPaiement) return false
    const schema = moyenPaiement === 'CB' ? CarteBancaireSchema : MandatSepaSchema
    const valeurs = moyenPaiement === 'CB' ? carteBancaire : mandatSepa
    const result = schema.safeParse(valeurs)
    if (!result.success) {
      const map: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!map[field]) map[field] = translateValidation(issue.message)
      }
      setErreurs(map)
      return false
    }
    setErreurs({})
    return true
  }

  async function confirmerPaiement() {
    if (!moyenPaiement) return
    if (!validerFormulaire()) return
    if (!isAuthenticated()) { setErreur({ type: 'non-authentifie' }); return }
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      const reponse = await creerDossier(construirePayloadDossier(wizard, codeAbonnement, moyenPaiement))
      dispatch(dossierBackendDefini(reponse.idDossier))
      dispatch(paiementValide())
      dispatch(abonnementSauvegarde(codeAbonnement))
      navigate({ to: '/dashboard' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setErreur({ type: 'non-authentifie' })
      } else if (err instanceof ApiError && err.status === 422) {
        // Le backend exige des pieces justificatives obligatoires (piece
        // d'identite + certificat scolarite si etudiant). Redirige vers
        // l'etape pieces avec un message clair.
        setErreur({ type: 'pieces-manquantes' })
      } else if (err instanceof ApiError) {
        setErreur({ type: 'autre', message: err.message })
      } else {
        setErreur({ type: 'autre', message: m.wizard_server_error() })
      }
    } finally {
      setEnvoiEnCours(false)
    }
  }

  function effacerErreur(field: string) {
    if (erreurs[field]) setErreurs((e) => ({ ...e, [field]: '' }))
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <button
        type="button"
        onClick={() => navigate({ to: '/souscription/recapitulatif', search: code ? { code } : {} })}
        className="flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={15} />
        {m.common_back()}
      </button>
      <ProgressBar etapeCourante={wizard.pourQui === 'TIERS' ? 5 : 4} totalEtapes={wizard.pourQui === 'TIERS' ? 5 : 4} />
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">{m.wizard_paiement_title()}</h1>
      <p className="text-gray-700">{nomAbonnement} — {prixAbonnement} / an</p>

      <div className="grid grid-cols-2 gap-3">
        <ChoiceCard icon={CreditCard} label={m.wizard_paiement_cb()} selected={moyenPaiement === 'CB'} onSelect={() => { setMoyenPaiement('CB'); setErreurs({}) }} />
        <ChoiceCard icon={Building2} label={m.wizard_paiement_sepa()} selected={moyenPaiement === 'SEPA'} onSelect={() => { setMoyenPaiement('SEPA'); setErreurs({}) }} />
      </div>

      {moyenPaiement === 'CB' ? <FormulaireCarteBancaire valeurs={carteBancaire} erreurs={erreurs} onChange={setCarteBancaire} onFieldChange={effacerErreur} /> : null}
      {moyenPaiement === 'SEPA' ? <FormulaireMandatSepa valeurs={mandatSepa} erreurs={erreurs} consenti={mandatSepaConsenti} onChange={setMandatSepa} onFieldChange={effacerErreur} onConsentementChange={setMandatSepaConsenti} /> : null}

      {erreur ? (
        <div className="rounded-lg bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger">
          {erreur.type === 'non-authentifie' ? (
            <>{m.wizard_not_connected_pay()}{' '}<Link to="/login" className="font-medium underline">{m.wizard_not_connected_login()}</Link></>
          ) : erreur.type === 'pieces-manquantes' ? (
            <>
              {m.wizard_paiement_pieces_required()}{' '}
              <button
                type="button"
                onClick={() => navigate({ to: '/souscription/pieces', search: code ? { code } : {} })}
                className="font-medium underline"
              >
                {m.wizard_paiement_pieces_go()}
              </button>
            </>
          ) : erreur.message}
        </div>
      ) : null}

      <div className="mt-2">
        <Button onClick={confirmerPaiement} disabled={envoiEnCours || !moyenPaiement || (moyenPaiement === 'SEPA' && !mandatSepaConsenti)} className="w-full">
          {envoiEnCours ? m.wizard_paiement_confirming() : m.wizard_paiement_confirm()}
        </Button>
      </div>
    </main>
  )
}

interface CarteBancaire { nom: string; numero: string; expiration: string; cvc: string }

function FormulaireCarteBancaire({ valeurs, erreurs, onChange, onFieldChange }: { valeurs: CarteBancaire; erreurs: Record<string, string>; onChange: (v: CarteBancaire) => void; onFieldChange: (f: string) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <ChampTexte label={m.wizard_paiement_cb_holder()} placeholder="Jean Dupont" value={valeurs.nom} erreur={erreurs.nom} onChange={(nom) => { onChange({ ...valeurs, nom }); onFieldChange('nom') }} />
      <ChampTexte label={m.wizard_paiement_cb_number()} placeholder="4242 4242 4242 4242" value={valeurs.numero} erreur={erreurs.numero} onChange={(numero) => { onChange({ ...valeurs, numero }); onFieldChange('numero') }} />
      <div className="grid grid-cols-2 gap-3">
        <ChampTexte label={m.wizard_paiement_cb_expiry()} placeholder="MM/AA" value={valeurs.expiration} erreur={erreurs.expiration} onChange={(expiration) => { const c = expiration.replace(/\D/g, '').slice(0, 4); const f = c.length > 2 ? c.slice(0, 2) + '/' + c.slice(2) : c; onChange({ ...valeurs, expiration: f }); onFieldChange('expiration') }} />
        <ChampTexte label={m.wizard_paiement_cb_cvc()} placeholder="123" value={valeurs.cvc} erreur={erreurs.cvc} onChange={(cvc) => { onChange({ ...valeurs, cvc }); onFieldChange('cvc') }} />
      </div>
    </div>
  )
}

const ICS_CREANCIER = 'FR00ZZZ123456'
interface MandatSepa { nom: string; iban: string; bic: string }

function FormulaireMandatSepa({ valeurs, erreurs, consenti, onChange, onFieldChange, onConsentementChange }: { valeurs: MandatSepa; erreurs: Record<string, string>; consenti: boolean; onChange: (v: MandatSepa) => void; onFieldChange: (f: string) => void; onConsentementChange: (v: boolean) => void }) {
  const rum = React.useId().replace(/:/g, '')
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
        <p>{m.wizard_paiement_sepa_rum()}<span className="block font-mono font-semibold text-dark">{rum}</span></p>
        <p>{m.wizard_paiement_sepa_ics()}<span className="block font-mono font-semibold text-dark">{ICS_CREANCIER}</span></p>
      </div>
      <ChampTexte label={m.wizard_paiement_sepa_holder()} placeholder="Jean Dupont" value={valeurs.nom} erreur={erreurs.nom} onChange={(nom) => { onChange({ ...valeurs, nom }); onFieldChange('nom') }} />
      <ChampTexte label={m.wizard_paiement_sepa_iban()} placeholder="FR76 1234 5678 9012 3456 7890 123" value={valeurs.iban} erreur={erreurs.iban} onChange={(iban) => { onChange({ ...valeurs, iban }); onFieldChange('iban') }} />
      <ChampTexte label={m.wizard_paiement_sepa_bic()} placeholder="BNPAFRPPXXX" value={valeurs.bic} erreur={erreurs.bic} onChange={(bic) => { onChange({ ...valeurs, bic }); onFieldChange('bic') }} />
      <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-primary" checked={consenti} onChange={(e) => onConsentementChange(e.target.checked)} />
        <span className="text-xs text-gray-700">{m.wizard_paiement_sepa_consent()}</span>
      </label>
    </div>
  )
}

function ChampTexte({ label, placeholder, value, erreur, onChange, readOnly = false }: { label: string; placeholder: string; value?: string; erreur?: string; onChange?: (v: string) => void; readOnly?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {label}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={!readOnly && onChange ? (e) => onChange(e.target.value) : undefined}
          className={`rounded-lg border px-3 py-2 font-sans text-dark ${erreur ? 'border-danger' : 'border-gray-300'} ${readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-700' : 'bg-white'}`}
        />
      </label>
      {erreur && <p className="text-xs text-danger">{erreur}</p>}
    </div>
  )
}
