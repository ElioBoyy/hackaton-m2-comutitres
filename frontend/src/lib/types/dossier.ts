export type StatutCategorie = 'en_cours' | 'abouti' | 'rejete' | 'clos'

export interface StatutDossier {
  code: string
  libelle: string
  categorie: StatutCategorie
}

export interface TypeAbonnement {
  code: string
  libelle: string
}

export interface DossierResume {
  idDossier: number
  nomTitulaire: string
  typeAbonnement: TypeAbonnement
  statut: StatutDossier
  nbPiecesEnAttente: number
  dateCreation: string
}

export interface DossierListResponse {
  dossiers: DossierResume[]
  page: number
  pageSize: number
  total: number
}
