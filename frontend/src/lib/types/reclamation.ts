/**
 * Types des reclamations (tickets SAV) cote API. La vue client riche
 * (`Reclamation` dans ~/lib/sav) est derivee de ces DTO par les mappers de
 * ~/lib/api. Le backoffice consomme directement ces types.
 */

export type GroupeStatutReclamation = 'ouvert' | 'en_cours' | 'resolu' | 'ferme'

export interface ReclamationMessageDto {
  auteur: 'CLIENT' | 'AGENT'
  contenu: string
  date: string
}

export interface ReclamationResumeDto {
  id: number
  reference: string
  objet: string
  codeCategorie: string
  libelleCategorie: string
  /** Statut fin (7 valeurs : ouvert, en_cours, en_attente_utilisateur, ...). */
  statut: string
  groupeStatut: GroupeStatutReclamation
  priorite: string
  nomClient: string | null
  agentAssigneNom: string | null
  dateCreation: string
  dateMiseAJour: string
}

export interface ReclamationDetailDto extends ReclamationResumeDto {
  origine: string
  messages: ReclamationMessageDto[]
}

export interface ReclamationListDto {
  reclamations: ReclamationResumeDto[]
  page: number
  pageSize: number
  total: number
}

export interface ReclamationCounts {
  tous: number
  ouvert: number
  enCours: number
  resolu: number
  ferme: number
}
