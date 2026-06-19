package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Detail d'une reclamation expose par l'API. {@code statut} = valeur fine
 * (7 statuts), {@code groupeStatut} = regroupement d'affichage (ouvert/en_cours/
 * resolu/ferme), utilise par le badge front.
 */
public record ReclamationDetailResponse(
        Integer id,
        String reference,
        String codeCategorie,
        String libelleCategorie,
        String objet,
        String statut,
        String groupeStatut,
        String priorite,
        String origine,
        String nomClient,
        String agentAssigneNom,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour,
        List<MessageReclamationResponse> messages
) implements Response {

    public static ReclamationDetailResponse from(Reclamation r) {
        return new ReclamationDetailResponse(
                r.id(),
                r.reference(),
                r.codeCategorie(),
                r.libelleCategorie(),
                r.objet(),
                r.statut().name(),
                r.statut().groupe().name(),
                r.priorite(),
                r.origine(),
                r.nomClient(),
                r.agentAssigneNom(),
                r.dateCreation(),
                r.dateMiseAJour(),
                r.messages().stream().map(MessageReclamationResponse::from).toList()
        );
    }
}
