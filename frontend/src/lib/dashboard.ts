import { apiFetch } from './api'

export type RoleDossier = 'PORTEUR_ET_PAYEUR' | 'PAYEUR' | 'PORTEUR'
export type TypeAlerte = 'REMBOURSEMENT_DISPONIBLE' | 'REDUCTION_DISPONIBLE' | string
export const FiltreDossiers = {
  ACTIVE:   'ACTIVE',
  EN_COURS: 'EN_COURS',
  FERME:    'FERME',
  ALL:      'ALL',
} as const

export type FiltreDossiers = typeof FiltreDossiers[keyof typeof FiltreDossiers]
export type CategorieStatut = 'abouti' | 'en_cours' | 'bloque' | string
export type TransportMode = 'METRO' | 'RER' | 'TRAIN' | 'TRAMWAY' | 'BUS'
export type ZoneNavigo = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5'

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
  numeroDossier: string
  role: RoleDossier
  porteurIdentite: UtilisateurIdentite
  payeurIdentite: UtilisateurIdentite
  typeAbonnementLibelle: string
  transports: TransportMode[]
  zones: ZoneNavigo[]
  statut: StatutDossierResume
  dateCreation: string
  dateDebutDroits: string | null
  dateFinDroits: string | null
  dateRenouvellement: string | null
  montantTotal: number
  piecesADeposer: boolean
  /** Nom complet du beneficiaire quand demandePour=TIERS. Null pour MOI. */
  beneficiaireNomComplet: string | null
}

export interface DashboardResponse {
  utilisateur: UtilisateurIdentite
  alertes: AlerteDashboard[]
  dossiers: DossierDashboard[]
}

export function fetchDashboard(filtre: FiltreDossiers = 'ACTIVE'): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/api/dashboard?folderFilter=${filtre}`)
}
