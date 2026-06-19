package fr.jegeremacartenavigo.domain.sav.model;

import java.time.LocalDateTime;

/**
 * Vue domaine resumee d'une reclamation, pour la liste (suivi client + file
 * backoffice).
 */
public record ReclamationResume(
        Integer id,
        String reference,
        String objet,
        String codeCategorie,
        String libelleCategorie,
        StatutReclamation statut,
        String priorite,
        String nomClient,
        String agentAssigneNom,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour
) {
}
