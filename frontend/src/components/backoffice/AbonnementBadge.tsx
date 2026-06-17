import type { TypeAbonnement } from '~/lib/types/dossier'

// Codes regroupés par profil usager
const ETUDIANTS = new Set(['IMAGINE_R_ETUDIANT', 'IMAGINE_R_SCOLAIRE', 'IMAGINE_R_APPRENTI'])
const RETRAITES = new Set(['SOLIDARITE_TRANSPORT'])
const ACTIFS = new Set(['NAVIGO_ANNUEL', 'NAVIGO_MENSUEL', 'NAVIGO_HEBDO', 'NAVIGO_LIBERTE_PLUS', 'NAVIGO_DECOUVERTE'])
const PARENTS_ENFANTS = new Set(['TRANSPORT_SCOLAIRE'])
const HANDICAP = new Set(['AMETHYSTE'])

function getStyle(code: string): string {
  if (ETUDIANTS.has(code)) return 'bg-blue-soft text-primary'
  if (RETRAITES.has(code)) return 'bg-accent-light/30 text-accent-light'
  if (ACTIFS.has(code)) return 'bg-secondary-light/30 text-secondary-light'
  if (PARENTS_ENFANTS.has(code)) return 'bg-accent/10 text-accent'
  if (HANDICAP.has(code)) return 'bg-warning-light/30 text-warning'
  return 'bg-gray-200 text-gray-700'
}

export function AbonnementBadge({ typeAbonnement }: { typeAbonnement: TypeAbonnement }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStyle(typeAbonnement.code)}`}
    >
      {typeAbonnement.libelle}
    </span>
  )
}
