package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;
import fr.jegeremacartenavigo.domain.dossier.port.AlerteDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.UtilisateurIdentiteRepository;

public class ObtenirDashboardUtilisateurHandler
        implements QueryHandler<ObtenirDashboardUtilisateurQuery, DashboardUtilisateurResponse> {

    private final UtilisateurIdentiteRepository utilisateurRepository;
    private final DossierDashboardRepository dossierRepository;
    private final AlerteDashboardRepository alerteRepository;

    public ObtenirDashboardUtilisateurHandler(UtilisateurIdentiteRepository utilisateurRepository,
                                              DossierDashboardRepository dossierRepository,
                                              AlerteDashboardRepository alerteRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.dossierRepository = dossierRepository;
        this.alerteRepository = alerteRepository;
    }

    @Override
    public DashboardUtilisateurResponse handle(ObtenirDashboardUtilisateurQuery query) {
        UtilisateurIdentite utilisateur = utilisateurRepository.findById(query.idUtilisateur())
                .orElseThrow(UtilisateurIntrouvableException::new);

        return new DashboardUtilisateurResponse(
                utilisateur,
                alerteRepository.findUnreadAlerts(query.idUtilisateur()),
                dossierRepository.findForUser(query.idUtilisateur(), query.folderFilter())
        );
    }
}
