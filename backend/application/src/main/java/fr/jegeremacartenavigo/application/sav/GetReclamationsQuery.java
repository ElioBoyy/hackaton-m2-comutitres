package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Query;
import jakarta.validation.constraints.Min;

/** File backoffice paginee. {@code groupeStatut} optionnel (ouvert/en_cours/resolu/ferme). */
public record GetReclamationsQuery(
        String groupeStatut,
        String nomClient,
        String reference,
        @Min(1) int page,
        @Min(1) int pageSize
) implements Query<ReclamationListResponse> {
}
