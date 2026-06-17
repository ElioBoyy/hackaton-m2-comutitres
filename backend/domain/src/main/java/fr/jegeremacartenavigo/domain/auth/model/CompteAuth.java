package fr.jegeremacartenavigo.domain.auth.model;

/**
 * Vue domaine unifiee d'un compte authentifiable, qu'il s'agisse d'un client
 * ({@link UtilisateurAuth}) ou d'un agent backoffice ({@link AgentAuth}).
 * Utilisee uniquement par le login generique (un seul point d'entree HTTP
 * pour les deux types de compte) ; les vues specifiques (avec leurs champs
 * propres : dateNaissance, equipe...) restent utilisees par /auth/me et
 * /auth/agent/me.
 */
public record CompteAuth(
        Integer id,
        String email,
        String motDePasseHash,
        String nom,
        String prenom,
        RoleCompte role,
        boolean actif
) {
    public boolean estActif() {
        return actif;
    }
}
