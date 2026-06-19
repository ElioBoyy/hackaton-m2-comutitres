package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Ajout d'un message au fil. {@code parAgent} distingue une reponse agent
 * (backoffice) d'un message client (espace SAV) ; {@code idAuteur} est l'id de
 * l'agent ou de l'utilisateur selon le cas.
 */
public record RepondreReclamationCommand(
        @NotNull Integer idReclamation,
        @NotBlank String contenu,
        @NotNull Integer idAuteur,
        boolean parAgent
) implements Command<ReclamationDetailResponse> {
}
