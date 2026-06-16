import { User, Users, type LucideIcon } from 'lucide-react'

// PourQui : indique si le porteur du formulaire fait la demande pour
// lui-meme ou pour un tiers (cf. CONTEXT.md). Collecte a l'etape 1 du
// RecommendationWizard. Le reste du formulaire (Situation, Frequence,
// Residence...) decrit toujours le futur titulaire de l'abonnement.
export type PourQui = 'MOI' | 'TIERS'

export const POUR_QUI: { value: PourQui; label: string; description?: string; icon: LucideIcon }[] = [
  { value: 'MOI', label: 'Pour moi', icon: User },
  { value: 'TIERS', label: 'Pour un tiers', description: 'enfant, proche...', icon: Users },
]
