package fr.jegeremacartenavigo.domain.auth.model;

import java.time.LocalDate;

/**
 * Vue domaine d'un utilisateur authentifiable. Decouple de l'entite JPA
 * {@code Utilisateur} (couche infra) : sert d'unique objet echange par les ports
 * et use cases d'authentification.
 *
 * <p>{@code id} est null pour un compte non encore persiste (avant register).
 */
public record UtilisateurAuth(
        Integer id,
        String email,
        String motDePasseHash,
        String nom,
        String prenom,
        LocalDate dateNaissance,
        StatutCompte statut
) {
    public boolean estActif() {
        return statut == StatutCompte.actif;
    }
}
