// Residence : lieu de residence collecte a l'etape 3 du RecommendationWizard
// (cf. CONTEXT.md). `resideEnIledeFrance` pilote le parcours, `region` est
// une information complementaire affichee.
export const REGIONS = [
  'Île-de-France',
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  "Provence-Alpes-Côte d'Azur",
] as const

export type Region = (typeof REGIONS)[number]

export interface Residence {
  region: Region
  resideEnIledeFrance: boolean
}

export const RESIDENCE_DEFAULT: Residence = {
  region: 'Île-de-France',
  resideEnIledeFrance: true,
}
