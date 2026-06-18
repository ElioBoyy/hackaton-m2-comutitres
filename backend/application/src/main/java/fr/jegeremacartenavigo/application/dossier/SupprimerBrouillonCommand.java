package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;

public record SupprimerBrouillonCommand(
        @NotNull Integer idDossier
) implements Command<StatutMisAJourResponse> {}
