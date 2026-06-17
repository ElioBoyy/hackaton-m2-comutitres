package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;
import fr.jegeremacartenavigo.domain.dossier.model.FiltreDossiers;
import jakarta.validation.constraints.NotNull;

public record ObtenirDashboardUtilisateurQuery(
        @NotNull Integer idUtilisateur,
        @NotNull FiltreDossiers folderFilter
) implements Query<DashboardUtilisateurResponse> {
}
