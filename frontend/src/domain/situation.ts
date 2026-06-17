import {
  Briefcase,
  GraduationCap,
  type LucideIcon,
  MoreHorizontal,
  Search,
  Sprout,
  Armchair,
} from 'lucide-react'

// Situation : categorie socio-professionnelle collectee a l'etape 1 du
// RecommendationWizard (cf. CONTEXT.md).
export type Situation =
  | 'ETUDIANT'
  | 'ACTIF'
  | 'DEMANDEUR_EMPLOI'
  | 'RETRAITE'
  | 'ALTERNANCE'
  | 'AUTRE'

export const SITUATIONS: { value: Situation; label: string; description?: string; icon: LucideIcon }[] = [
  { value: 'ETUDIANT', label: 'Étudiant', icon: GraduationCap },
  { value: 'ACTIF', label: 'Actif', icon: Briefcase },
  { value: 'DEMANDEUR_EMPLOI', label: "Demandeur d'emploi", icon: Search },
  { value: 'RETRAITE', label: 'Retraité', description: '65 ans et plus', icon: Armchair },
  { value: 'ALTERNANCE', label: 'En alternance', icon: Sprout },
  { value: 'AUTRE', label: 'Autre situation', description: 'précisez', icon: MoreHorizontal },
]
