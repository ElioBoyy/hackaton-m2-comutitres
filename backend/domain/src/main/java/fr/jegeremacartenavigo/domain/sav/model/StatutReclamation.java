package fr.jegeremacartenavigo.domain.sav.model;

/**
 * Statut d'une reclamation (ticket SAV). Reprend les 7 valeurs de la table
 * {@code ticket_sav.statut}. Le {@link #groupe()} regroupe ces statuts en 4
 * categories d'affichage (file backoffice + suivi client).
 */
public enum StatutReclamation {
    ouvert,
    en_cours,
    en_attente_utilisateur,
    en_attente_interne,
    resolu,
    ferme,
    reouvert;

    /** Regroupement metier pour l'affichage et le filtre de la liste. */
    public GroupeStatutReclamation groupe() {
        return switch (this) {
            case ouvert, reouvert -> GroupeStatutReclamation.ouvert;
            case en_cours, en_attente_utilisateur, en_attente_interne -> GroupeStatutReclamation.en_cours;
            case resolu -> GroupeStatutReclamation.resolu;
            case ferme -> GroupeStatutReclamation.ferme;
        };
    }
}
