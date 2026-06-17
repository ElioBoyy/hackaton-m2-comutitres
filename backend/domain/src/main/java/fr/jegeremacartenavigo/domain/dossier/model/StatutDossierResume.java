package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Vue domaine du statut courant d'un dossier. {@code ordre} et
 * {@code categorie} permettent au front de construire la frise (stepper) a
 * partir du referentiel des statuts, sans historique reel des transitions
 * (qui n'existe pas en base).
 */
public record StatutDossierResume(
        String code,
        String libelle,
        Integer ordre,
        CategorieStatutDossier categorie
) {
}
