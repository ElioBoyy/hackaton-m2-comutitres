import { apiFetch } from '~/lib/api'

/**
 * Client pour POST /dossiers (cf. CONTEXT.md / CreerDossier backend).
 * Les enums (pourQui, situation, modePaiement) sont envoyees telles quelles :
 * les noms cote front (MOI/TIERS, ETUDIANT/ACTIF/..., CB/SEPA) correspondent
 * exactement aux enums Java deserialises par Jackson, aucune traduction
 * necessaire. `codeTypeAbonnement` doit etre un `type_abonnement.code`
 * existant (cf. ~/domain/abonnement.ts, ids alignes sur les codes backend).
 *
 * `modePaiement` est optionnel : absent, le dossier est sauvegarde en
 * brouillon (statut EN_ATTENTE_PAIEMENT, pas de Paiement cree) - c'est ce
 * qu'envoient les boutons "Sauvegarder et quitter". Present (ecran
 * Paiement), le dossier passe ACTIF avec un Paiement mock "valide".
 *
 * `idDossierExistant` (optionnel) complete un brouillon deja sauvegarde
 * plutot que d'en creer un nouveau - evite les doublons quand l'usager
 * sauvegarde puis revient payer plus tard (cf. wizardSlice.idDossierBackend).
 */
export interface CreerDossierPayload {
  idDossierExistant?: number
  pourQui: 'MOI' | 'TIERS'
  beneficiaireNomComplet?: string
  situation: 'ETUDIANT' | 'ACTIF' | 'DEMANDEUR_EMPLOI' | 'RETRAITE' | 'ALTERNANCE' | 'AUTRE'
  situationPrecision?: string
  boursier: boolean
  codeTypeAbonnement: string
  cheminPieceIdentite?: string
  cheminCertificatScolarite?: string
  cheminNotificationBourse?: string
  modePaiement?: 'CB' | 'SEPA'
  enAttentePaiement?: boolean
}

export interface DossierResponse {
  idDossier: number
  codeStatut: string
  montantTotal: number
  modePaiement: 'CB' | 'SEPA' | null
  dateCreation: string
}

export interface PersonneDetail {
  idUtilisateur: number
  nom: string
  prenom: string
  email: string
}

export interface PieceJustificative {
  id: number
  codeTypePiece: string
  libelleTypePiece: string
  statutValidation: 'en_attente' | 'valide' | 'rejete' | string
  dateDepot: string
  motifRejet: string | null
  cheminFichier: string | null
  /** True si un agent a depose ou remplace ce fichier depuis le backoffice. */
  modifieParAgent: boolean
  /** True si la piece a ete pre-verifiee par l'IA (reset au remplacement). */
  verifieParIA: boolean
}

export interface PieceRequise {
  codeTypePiece: string
  libelleTypePiece: string
  obligatoire: boolean
}

export interface DossierDetail {
  idDossier: number
  titulaire: PersonneDetail
  payeur: PersonneDetail
  typeAbonnement: { code: string; libelle: string }
  statut: { code: string; libelle: string; categorie: string }
  dateCreation: string
  dateDebutDroits: string | null
  dateFinDroits: string | null
  montantTotal: number
  beneficiaireNomComplet: string | null
  /** Vrai si l'utilisateur s'est declare boursier au wizard de souscription. */
  boursier: boolean
  pieces: PieceJustificative[]
  piecesRequises: PieceRequise[]
}

export interface StatutMisAJour {
  idDossier: number
  codeStatut: string
}

export interface PieceADeposer {
  codeTypePiece: string
  cheminFichier: string
}

export function fetchDossierDetail(id: number): Promise<DossierDetail> {
  return apiFetch<DossierDetail>(`/dossiers/${id}`)
}

export function resilierDossier(id: number): Promise<StatutMisAJour> {
  return apiFetch<StatutMisAJour>(`/dossiers/${id}/resilier`, { method: 'POST' })
}

export function lancerPreVerificationIA(id: number): Promise<DossierDetail> {
  return apiFetch<DossierDetail>(`/dossiers/${id}/pre-verification-ia`, { method: 'POST' })
}

export function soumettreEnVerification(id: number, pieces: PieceADeposer[]): Promise<StatutMisAJour> {
  return apiFetch<StatutMisAJour>(`/dossiers/${id}/soumettre`, {
    method: 'POST',
    body: JSON.stringify({ pieces }),
  })
}

export function enregistrerPieces(id: number, pieces: PieceADeposer[]): Promise<StatutMisAJour> {
  return apiFetch<StatutMisAJour>(`/dossiers/${id}/pieces`, {
    method: 'POST',
    body: JSON.stringify({ pieces }),
  })
}

export function supprimerDossier(id: number): Promise<StatutMisAJour> {
  return apiFetch<StatutMisAJour>(`/dossiers/${id}`, { method: 'DELETE' })
}

export function creerDossier(payload: CreerDossierPayload): Promise<DossierResponse> {
  return apiFetch<DossierResponse>('/dossiers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Sous-ensemble du WizardState (cf. wizardSlice.ts) necessaire pour
// construire un CreerDossierPayload, partage entre les boutons "Sauvegarder
// et quitter" (resultat.tsx, recapitulatif.tsx) et l'ecran Paiement.
export interface WizardPourDossier {
  pourQui: 'MOI' | 'TIERS' | null
  infosTiers: { prenom: string; nom: string }
  situation: CreerDossierPayload['situation'] | null
  situationPrecision: string
  boursier: boolean
  pieceIdentiteCleObjet: string | null
  justificatifEtudiantCleObjet: string | null
  notificationBourseCleObjet: string | null
  idDossierBackend: number | null
}

export function construirePayloadDossier(
  wizard: WizardPourDossier,
  codeTypeAbonnement: string,
  modePaiement?: 'CB' | 'SEPA',
  enAttentePaiement?: boolean,
): CreerDossierPayload {
  return {
    idDossierExistant: wizard.idDossierBackend ?? undefined,
    pourQui: wizard.pourQui ?? 'MOI',
    beneficiaireNomComplet:
      wizard.pourQui === 'TIERS'
        ? `${wizard.infosTiers.prenom} ${wizard.infosTiers.nom}`.trim()
        : undefined,
    situation: wizard.situation ?? 'AUTRE',
    situationPrecision: wizard.situationPrecision || undefined,
    boursier: wizard.boursier,
    codeTypeAbonnement,
    cheminPieceIdentite: wizard.pieceIdentiteCleObjet ?? undefined,
    cheminCertificatScolarite: wizard.justificatifEtudiantCleObjet ?? undefined,
    cheminNotificationBourse: wizard.notificationBourseCleObjet ?? undefined,
    modePaiement,
    enAttentePaiement,
  }
}
