import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { RESIDENCE_DEFAULT, type Residence } from '~/domain/residence'
import type { FrequenceDeplacement } from '~/domain/frequenceDeplacement'
import type { PourQui } from '~/domain/pourQui'
import type { Situation } from '~/domain/situation'
import type { TypeAbonnement } from '~/lib/api'

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
  // Abonnement choisi directement depuis la page d'accueil (modal "+ d'infos")
  // sans passer par le questionnaire. Quand defini, souscription/detail
  // l'affiche directement sans passer par calculerRecommandation.
  typeAbonnementDirecte: TypeAbonnement | null
  // PreVerificationIA (cf. CONTEXT.md) : pieces deposees a l'etape /pieces et
  // statut de la verification. L'upload reel passe par POST /fichiers (bucket
  // MinIO prive) : on stocke le nom d'origine pour l'affichage ET la cle
  // objet renvoyee par le backend, transmise dans CreerDossierPayload comme
  // {@code chemin*}.
  pieceIdentiteNomFichier: string | null
  pieceIdentiteCleObjet: string | null
  justificatifEtudiantNomFichier: string | null
  justificatifEtudiantCleObjet: string | null
  notificationBourseNomFichier: string | null
  notificationBourseCleObjet: string | null
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
  // Id du Dossier backend une fois sauvegarde au moins une fois (bouton
  // "Sauvegarder et quitter" ou paiement). Permet de completer ce meme
  // dossier au lieu d'en creer un nouveau a chaque sauvegarde - evite les
  // doublons en base (cf. CONTEXT.md / CreerDossier).
  idDossierBackend: number | null
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
  typeAbonnementDirecte: null,
  pieceIdentiteNomFichier: null,
  pieceIdentiteCleObjet: null,
  justificatifEtudiantNomFichier: null,
  justificatifEtudiantCleObjet: null,
  notificationBourseNomFichier: null,
  notificationBourseCleObjet: null,
  verificationIA: 'NON_DEMANDEE',
  abonnementSauvegardeId: null,
  paiementEffectue: false,
  idDossierBackend: null,
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
    typeAbonnementDirecteDefini(state, action: PayloadAction<TypeAbonnement>) {
      state.typeAbonnementDirecte = action.payload
    },
    pieceIdentiteDeposee(state, action: PayloadAction<{ nomFichier: string; cleObjet: string }>) {
      state.pieceIdentiteNomFichier = action.payload.nomFichier
      state.pieceIdentiteCleObjet = action.payload.cleObjet
    },
    justificatifEtudiantDepose(state, action: PayloadAction<{ nomFichier: string; cleObjet: string }>) {
      state.justificatifEtudiantNomFichier = action.payload.nomFichier
      state.justificatifEtudiantCleObjet = action.payload.cleObjet
    },
    notificationBourseDeposee(state, action: PayloadAction<{ nomFichier: string; cleObjet: string }>) {
      state.notificationBourseNomFichier = action.payload.nomFichier
      state.notificationBourseCleObjet = action.payload.cleObjet
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
    dossierBackendDefini(state, action: PayloadAction<number>) {
      state.idDossierBackend = action.payload
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
  typeAbonnementDirecteDefini,
  pieceIdentiteDeposee,
  justificatifEtudiantDepose,
  notificationBourseDeposee,
  verificationIAEffectuee,
  abonnementSauvegarde,
  paiementValide,
  dossierBackendDefini,
  wizardReinitialise,
} = wizardSlice.actions

export default wizardSlice.reducer
