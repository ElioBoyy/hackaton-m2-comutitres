package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Identite minimale d'un utilisateur (pour affichage uniquement : en-tete du
 * dashboard, ou "autre personne" d'un dossier). Volontairement plus etroit que
 * {@code UtilisateurAuth} (pas de hash de mot de passe, pas de statut de
 * compte) : ce contexte n'en a pas besoin.
 */
public record UtilisateurIdentite(
        Integer idUtilisateur,
        String nom,
        String prenom
) {
}
