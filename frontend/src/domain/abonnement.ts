// Abonnement : offre de transport proposee en sortie du RecommendationWizard
// (cf. CONTEXT.md). Catalogue statique pour ce hackathon, pas d'API de
// lecture. `id` correspond exactement au `type_abonnement.code` backend
// (cf. CONTEXT.md / CreerDossier) : c'est cet identifiant qui est envoye a
// POST /dossiers pour que le backend retrouve le bon type_abonnement.
export interface Abonnement {
  id: string
  nom: string
  zones: string
  prixAnnuelEuros: number
  inclus: string[]
}

export const CATALOGUE_ABONNEMENTS: Abonnement[] = [
  {
    id: 'NAVIGO_ANNUEL',
    nom: 'Navigo Annuel',
    zones: 'Zones 1-5',
    prixAnnuelEuros: 870.7,
    inclus: ['Bus, Métro, Tram, RER', 'Train (Transilien)', 'Mobilités complémentaires'],
  },
  {
    id: 'NAVIGO_MENSUEL',
    nom: 'Navigo Mois',
    zones: 'Zones 1-5',
    prixAnnuelEuros: 84.1 * 12,
    inclus: ['Bus, Métro, Tram, RER', 'Train (Transilien)'],
  },
  {
    id: 'NAVIGO_LIBERTE_PLUS',
    nom: 'Liberté +',
    zones: 'À la demande',
    prixAnnuelEuros: 65 * 12,
    inclus: ['Trajets à l’unité, sans engagement'],
  },
  {
    id: 'IMAGINE_R_ETUDIANT',
    nom: 'Imagine R Étudiant',
    zones: 'Zones 1-5',
    prixAnnuelEuros: 398.1,
    inclus: ['Bus, Métro, Tram, RER', 'Train (Transilien)', 'Tarif étudiant'],
  },
]

export function getAbonnement(id: string): Abonnement {
  const abonnement = CATALOGUE_ABONNEMENTS.find((item) => item.id === id)
  if (!abonnement) {
    throw new Error(`Abonnement inconnu: ${id}`)
  }
  return abonnement
}
