package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.AlerteDashboard;

import java.util.List;

/**
 * Port secondaire : alertes reduction/remboursement non lues d'un utilisateur,
 * pour le bandeau du tableau de bord. Implementation JPA dans la couche
 * infrastructure.
 */
public interface AlerteDashboardRepository {
    List<AlerteDashboard> findUnreadAlerts(Integer idUtilisateur);
}
