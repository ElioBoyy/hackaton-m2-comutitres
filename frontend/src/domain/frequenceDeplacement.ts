import { CalendarCheck, CalendarClock, CalendarRange, type LucideIcon } from 'lucide-react'

// FrequenceDeplacement : rythme de deplacement collecte a l'etape 2 du
// RecommendationWizard (cf. CONTEXT.md).
export type FrequenceDeplacement = 'QUOTIDIEN' | 'REGULIER' | 'OCCASIONNEL'

export const FREQUENCES_DEPLACEMENT: {
  value: FrequenceDeplacement
  label: string
  description: string
  icon: LucideIcon
}[] = [
  { value: 'QUOTIDIEN', label: 'Tous les jours', description: '5j/semaine ou plus', icon: CalendarCheck },
  { value: 'REGULIER', label: 'Plusieurs fois par semaine', description: '2 à 4j/semaine', icon: CalendarRange },
  { value: 'OCCASIONNEL', label: 'Occasionnellement', description: 'moins de 2j/semaine', icon: CalendarClock },
]
