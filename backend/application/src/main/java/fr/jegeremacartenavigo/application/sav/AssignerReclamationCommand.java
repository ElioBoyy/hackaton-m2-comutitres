package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;

/** Assignation d'une reclamation a un agent (s'attribuer un ticket). */
public record AssignerReclamationCommand(
        @NotNull Integer idReclamation,
        @NotNull Integer idAgent
) implements Command<ReclamationDetailResponse> {
}
