package fr.jegeremacartenavigo.domain.auth.model;

/**
 * Vue domaine d'un agent backoffice authentifiable. Decouple de l'entite JPA
 * {@code Agent} (couche infra), sur le meme principe que {@link UtilisateurAuth}.
 */
public record AgentAuth(
        Integer id,
        String email,
        String motDePasseHash,
        String nom,
        String prenom,
        boolean actif
) {
    public boolean estActif() {
        return actif;
    }
}
