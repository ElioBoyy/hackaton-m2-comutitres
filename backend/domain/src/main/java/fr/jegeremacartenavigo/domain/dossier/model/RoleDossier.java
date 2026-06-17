package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Role de l'utilisateur connecte vis-a-vis d'un dossier donne. Un dossier a
 * toujours un porteur (titulaire) et un payeur (financeur), qui peuvent etre
 * la meme personne.
 */
public enum RoleDossier {
    PORTEUR,
    PAYEUR,
    PORTEUR_ET_PAYEUR
}
