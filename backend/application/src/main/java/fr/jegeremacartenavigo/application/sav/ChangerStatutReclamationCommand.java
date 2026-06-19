package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Command;
import fr.jegeremacartenavigo.domain.sav.model.StatutReclamation;
import jakarta.validation.constraints.NotNull;

/** Changement de statut d'une reclamation (action agent backoffice). */
public record ChangerStatutReclamationCommand(
        @NotNull Integer idReclamation,
        @NotNull StatutReclamation statut,
        @NotNull Integer idAgent
) implements Command<ReclamationDetailResponse> {
}
