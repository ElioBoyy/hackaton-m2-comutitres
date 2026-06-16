package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.AlerteDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;

import java.util.List;

public record DashboardUtilisateurResponse(
        UtilisateurIdentite utilisateur,
        List<AlerteDashboard> alertes,
        List<DossierDashboard> dossiers
) implements Response {
}
