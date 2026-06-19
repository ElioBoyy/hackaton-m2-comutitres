package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Ouverture d'une reclamation depuis l'espace client. */
public record CreerReclamationCommand(
        @NotNull Integer idUtilisateur,
        @NotBlank String codeCategorie,
        @NotBlank @Size(max = 200) String objet,
        @NotBlank String description
) implements Command<ReclamationDetailResponse> {
}
