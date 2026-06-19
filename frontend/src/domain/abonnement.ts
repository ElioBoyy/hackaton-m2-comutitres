import type { TypeAbonnement } from '~/lib/api'

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

/**
 * Convertit un {@link TypeAbonnement} (referentiel backend) en
 * {@link Abonnement} consommable par le moteur de recommandation. Le prix
 * annuel est extrapole depuis {@code tarifPlein} + {@code periodicite}
 * (mensuel * 12, hebdo * 52). Renvoie {@code null} pour un tarif inconnu
 * (typiquement les abonnements gratuits ou a tarification sociale qui
 * n'ont pas leur place dans une comparaison de prix).
 */
export function typeAbonnementVersAbonnement(t: TypeAbonnement): Abonnement | null {
  if (t.tarifPlein === null) return null
  const tarif = Number(t.tarifPlein)
  let prixAnnuel: number
  switch (t.periodicite) {
    case 'annuelle':     prixAnnuel = tarif; break
    case 'mensuelle':    prixAnnuel = tarif * 12; break
    case 'hebdomadaire': prixAnnuel = tarif * 52; break
    default:             prixAnnuel = tarif
  }
  return {
    id: t.code,
    nom: t.libelle,
    zones: libelleZones(t.zones),
    prixAnnuelEuros: prixAnnuel,
    inclus: t.description ? [t.description] : [],
  }
}

function libelleZones(zones: string[]): string {
  if (zones.length === 0) return '—'
  const nums = zones
    .map((z) => Number(z.replace(/^Z/, '')))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
  if (nums.length === 0) return zones.join(' · ')
  if (nums.length === 1) return `Zone ${nums[0]}`
  return `Zones ${nums[0]}-${nums[nums.length - 1]}`
}
