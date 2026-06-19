package fr.jegeremacartenavigo.domain.sav.model;

/**
 * Regroupement des statuts de reclamation pour l'affichage (badge) et le filtre
 * de la liste backoffice : un agent raisonne en "ouvert / en cours / resolu /
 * ferme", pas avec les 7 statuts fins de {@link StatutReclamation}.
 */
public enum GroupeStatutReclamation {
    ouvert,
    en_cours,
    resolu,
    ferme
}
