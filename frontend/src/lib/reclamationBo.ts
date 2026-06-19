/**
 * Libelles et mappings d'affichage des reclamations cote backoffice. Le
 * backoffice affiche les 7 statuts fins en clair (francais) ; la liste et le
 * badge raisonnent par groupe (cf. ~/lib/types/reclamation).
 */
import type { StatutCategorie } from '~/lib/types/dossier'
import type { GroupeStatutReclamation } from '~/lib/types/reclamation'

/** Statut fin -> libelle francais. */
export const LIBELLE_STATUT: Record<string, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente_utilisateur: 'En attente client',
  en_attente_interne: 'En attente interne',
  resolu: 'Résolu',
  ferme: 'Fermé',
  reouvert: 'Réouvert',
}

/** Groupe -> libelle pour le filtre. */
export const LIBELLE_GROUPE: Record<GroupeStatutReclamation, string> = {
  ouvert: 'Ouvertes',
  en_cours: 'En cours',
  resolu: 'Résolues',
  ferme: 'Fermées',
}

export const LIBELLE_PRIORITE: Record<string, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
}

/** Groupe de statut -> categorie de badge (StatusBadge). */
export function categorieBadge(groupe: GroupeStatutReclamation): StatutCategorie {
  switch (groupe) {
    case 'resolu':
      return 'abouti'
    case 'ferme':
      return 'clos'
    default:
      return 'en_cours'
  }
}

/** Statuts qu'un agent peut appliquer depuis la fiche (ordre de traitement). */
export const STATUTS_AGENT: { value: string; label: string }[] = [
  { value: 'ouvert', label: LIBELLE_STATUT.ouvert },
  { value: 'en_cours', label: LIBELLE_STATUT.en_cours },
  { value: 'en_attente_utilisateur', label: LIBELLE_STATUT.en_attente_utilisateur },
  { value: 'en_attente_interne', label: LIBELLE_STATUT.en_attente_interne },
  { value: 'resolu', label: LIBELLE_STATUT.resolu },
  { value: 'ferme', label: LIBELLE_STATUT.ferme },
  { value: 'reouvert', label: LIBELLE_STATUT.reouvert },
]
