package fr.jegeremacartenavigo.domain.sav.model;

/**
 * Donnees d'entree pour ouvrir une reclamation depuis l'espace client.
 * {@code idUtilisateur} est le porteur (connecte) ; {@code codeCategorie} doit
 * exister dans {@code categorie_sav}.
 */
public record NouvelleReclamation(
        Integer idUtilisateur,
        String codeCategorie,
        String objet,
        String description
) {
}
