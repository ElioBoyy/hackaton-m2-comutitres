package fr.jegeremacartenavigo.domain.sav.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue domaine detaillee d'une reclamation : en-tete + fil de messages. Sert
 * autant le suivi cote client que la fiche de traitement cote backoffice.
 */
public record Reclamation(
        Integer id,
        String reference,
        String codeCategorie,
        String libelleCategorie,
        String objet,
        StatutReclamation statut,
        String priorite,
        String origine,
        String nomClient,
        String agentAssigneNom,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour,
        List<MessageReclamation> messages
) {
}
