import { apiFetch } from './api'

export type RoleDossier = 'PORTEUR_ET_PAYEUR' | 'PAYEUR' | 'PORTEUR'
export type TypeAlerte = 'REMBOURSEMENT_DISPONIBLE' | 'REDUCTION_DISPONIBLE' | string
export type FiltreDossiers = 'ACTIVE' | 'ALL'
export type CategorieStatut = 'abouti' | 'en_cours' | 'bloque' | string

export interface UtilisateurIdentite {
  idUtilisateur: number
  nom: string
  prenom: string
}

export interface StatutDossierResume {
  code: string
  libelle: string
  ordre: number
  categorie: CategorieStatut
}

export interface AlerteDashboard {
  idNotification: number
  type: TypeAlerte
  titre: string
  contenu: string
  dateCreation: string
}

export interface DossierDashboard {
  idDossier: number
  role: RoleDossier
  autrePersonne: UtilisateurIdentite | null
  typeAbonnementLibelle: string
  statut: StatutDossierResume
  dateCreation: string
  dateDebutDroits: string
  dateFinDroits: string
  montantTotal: number
  piecesADeposer: boolean
}

export interface DashboardResponse {
  utilisateur: UtilisateurIdentite
  alertes: AlerteDashboard[]
  dossiers: DossierDashboard[]
}

export function fetchDashboard(filtre: FiltreDossiers = 'ACTIVE'): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/api/dashboard?folderFilter=${filtre}`)
}
