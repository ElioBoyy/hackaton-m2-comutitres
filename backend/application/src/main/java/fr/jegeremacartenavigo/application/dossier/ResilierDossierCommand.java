package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;

public record ResilierDossierCommand(@NotNull Integer idDossier) implements Command<StatutMisAJourResponse> {
}
