package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Query;
import jakarta.validation.constraints.NotNull;

/** Suivi client : les reclamations de l'utilisateur connecte. */
public record GetMesReclamationsQuery(
        @NotNull Integer idUtilisateur
) implements Query<ReclamationListResponse> {
}
