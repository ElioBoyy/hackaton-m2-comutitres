package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.domain.sav.model.ReclamationResume;

import java.time.LocalDateTime;

public record ReclamationResumeResponse(
        Integer id,
        String reference,
        String objet,
        String codeCategorie,
        String libelleCategorie,
        String statut,
        String groupeStatut,
        String priorite,
        String nomClient,
        String agentAssigneNom,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour
) {
    public static ReclamationResumeResponse from(ReclamationResume r) {
        return new ReclamationResumeResponse(
                r.id(),
                r.reference(),
                r.objet(),
                r.codeCategorie(),
                r.libelleCategorie(),
                r.statut().name(),
                r.statut().groupe().name(),
                r.priorite(),
                r.nomClient(),
                r.agentAssigneNom(),
                r.dateCreation(),
                r.dateMiseAJour()
        );
    }
}
