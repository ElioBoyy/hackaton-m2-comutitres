package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;
import jakarta.validation.constraints.NotNull;

public record GetDossierDetailQuery(@NotNull Integer id) implements Query<DossierDetailResponse> {
}
