package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Query;
import jakarta.validation.constraints.NotNull;

/**
 * Detail d'une reclamation. {@code idProprietaire} non null = acces client
 * restreint au porteur (ownership) ; null = acces agent (backoffice).
 */
public record GetReclamationDetailQuery(
        @NotNull Integer id,
        Integer idProprietaire
) implements Query<ReclamationDetailResponse> {
}
