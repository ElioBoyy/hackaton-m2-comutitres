import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { RESIDENCE_DEFAULT, type Residence } from '~/domain/residence'
import type { FrequenceDeplacement } from '~/domain/frequenceDeplacement'
import type { PourQui } from '~/domain/pourQui'
import type { Situation } from '~/domain/situation'

// Infos du tiers beneficiaire, collectees sur l'ecran infos-tiers quand
// PourQui = 'TIERS' (cf. CONTEXT.md).
export interface InfosTiers {
  prenom: string
  nom: string
}

const INFOS_TIERS_DEFAUT: InfosTiers = { prenom: '', nom: '' }

// Etat du RecommendationWizard (cf. CONTEXT.md) : les reponses des etapes de
// saisie, conservees en memoire pendant la navigation entre les routes
// /recommandation/*.
export interface WizardState {
  pourQui: PourQui | null
  infosTiers: InfosTiers
  situation: Situation | null
  situationPrecision: string
  boursier: boolean
  frequenceDeplacement: FrequenceDeplacement | null
  residence: Residence
  // Abonnement choisi par l'usager sur l'ecran resultat. null = on suit la
  // recommandation principale calculee par calculerRecommandation.
  abonnementSelectionneId: string | null
  // PreVerificationIA (cf. CONTEXT.md) : pieces deposees a l'etape /pieces et
  // statut de la verification. Pas de vrai upload reseau, juste le nom du
  // fichier choisi par l'usager.
  pieceIdentiteNomFichier: string | null
  justificatifEtudiantNomFichier: string | null
  notificationBourseNomFichier: string | null
  verificationIA: 'NON_DEMANDEE' | 'EFFECTUEE'
  // Abonnement sauvegarde via le bouton "Sauvegarder et quitter", lu par le
  // dashboard. Distinct de abonnementSelectionneId pour ne pas confondre
  // "choisi sur l'ecran resultat" et "sauvegarde pour de bon".
  abonnementSauvegardeId: string | null
  // Etape Paiement (cf. CONTEXT.md) : ecran juste apres le recapitulatif.
  // Pas de vrai paiement, juste un mock de formulaire (CB ou mandat SEPA) ;
  // le choix de moyen de paiement et les champs saisis restent locaux a la
  // route, seul le fait d'avoir "valide" est conserve.
  paiementEffectue: boolean
}

const initialState: WizardState = {
  pourQui: null,
  infosTiers: INFOS_TIERS_DEFAUT,
  situation: null,
  situationPrecision: '',
  boursier: false,
  frequenceDeplacement: null,
  residence: RESIDENCE_DEFAULT,
  abonnementSelectionneId: null,
  pieceIdentiteNomFichier: null,
  justificatifEtudiantNomFichier: null,
  notificationBourseNomFichier: null,
  verificationIA: 'NON_DEMANDEE',
  abonnementSauvegardeId: null,
  paiementEffectue: false,
}

const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    pourQuiDefini(state, action: PayloadAction<PourQui>) {
      state.pourQui = action.payload
      if (action.payload === 'MOI') state.infosTiers = INFOS_TIERS_DEFAUT
    },
    infosTiersDefinies(state, action: PayloadAction<InfosTiers>) {
      state.infosTiers = action.payload
    },
    situationDefinie(state, action: PayloadAction<{ situation: Situation; precision?: string }>) {
      state.situation = action.payload.situation
      state.situationPrecision = action.payload.precision ?? ''
      if (action.payload.situation !== 'ETUDIANT') state.boursier = false
    },
    boursierDefini(state, action: PayloadAction<boolean>) {
      state.boursier = action.payload
    },
    frequenceDeplacementDefinie(state, action: PayloadAction<FrequenceDeplacement>) {
      state.frequenceDeplacement = action.payload
    },
    residenceDefinie(state, action: PayloadAction<Residence>) {
      state.residence = action.payload
    },
    abonnementSelectionne(state, action: PayloadAction<string>) {
      state.abonnementSelectionneId = action.payload
    },
    pieceIdentiteDeposee(state, action: PayloadAction<string>) {
      state.pieceIdentiteNomFichier = action.payload
    },
    justificatifEtudiantDepose(state, action: PayloadAction<string>) {
      state.justificatifEtudiantNomFichier = action.payload
    },
    notificationBourseDeposee(state, action: PayloadAction<string>) {
      state.notificationBourseNomFichier = action.payload
    },
    verificationIAEffectuee(state) {
      state.verificationIA = 'EFFECTUEE'
    },
    abonnementSauvegarde(state, action: PayloadAction<string>) {
      state.abonnementSauvegardeId = action.payload
    },
    paiementValide(state) {
      state.paiementEffectue = true
    },
    wizardReinitialise() {
      return initialState
    },
  },
})

export const {
  pourQuiDefini,
  infosTiersDefinies,
  situationDefinie,
  boursierDefini,
  frequenceDeplacementDefinie,
  residenceDefinie,
  abonnementSelectionne,
  pieceIdentiteDeposee,
  justificatifEtudiantDepose,
  notificationBourseDeposee,
  verificationIAEffectuee,
  abonnementSauvegarde,
  paiementValide,
  wizardReinitialise,
} = wizardSlice.actions

export default wizardSlice.reducer
