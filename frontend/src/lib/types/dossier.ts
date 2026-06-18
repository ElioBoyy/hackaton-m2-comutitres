export type StatutCategorie = 'en_cours' | 'abouti' | 'rejete' | 'clos'

export interface Personne {
  idUtilisateur: number
  nom: string
  prenom: string
  email: string
}

export interface PieceJustificative {
  id: number
  /** Code metier (ex: "PIECE_IDENTITE") - stable, utilise pour le filtrage. */
  codeTypePiece: string
  libelleTypePiece: string
  /** Cle MinIO (peut etre absente si pas encore deposee). A passer a recupererContenu(). */
  cheminFichier: string | null
  statutValidation: 'en_attente' | 'validee' | 'rejetee'
  dateDepot: string
  motifRejet: string | null
  /** True si un agent a depose ou remplace ce fichier depuis le backoffice. */
  modifieParAgent: boolean
}

export interface PieceRequise {
  codeTypePiece: string
  libelleTypePiece: string
  obligatoire: boolean
}

export interface DossierDetail {
  idDossier: number
  numeroDossier: string
  titulaire: Personne
  payeur: Personne
  typeAbonnement: { code: string; libelle: string }
  statut: { code: string; libelle: string; categorie: StatutCategorie }
  dateCreation: string
  dateDebutDroits: string | null
  dateFinDroits: string | null
  montantTotal: number
  pieces: PieceJustificative[]
  piecesRequises: PieceRequise[]
}

export interface HistoriqueEntree {
  id: number
  dateAction: string
  typeAction: string
  statutAvant: string | null
  statutApres: string | null
  nomAuteur: string
  description: string | null
}

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
  numeroDossier: string
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
