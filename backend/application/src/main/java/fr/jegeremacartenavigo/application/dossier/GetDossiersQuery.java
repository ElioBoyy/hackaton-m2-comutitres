package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;
import jakarta.validation.constraints.Min;

public record GetDossiersQuery(
        String statut,
        String nomClient,
        String numeroDossier,
        @Min(1) int page,
        @Min(1) int pageSize
) implements Query<DossierListResponse> {
}
