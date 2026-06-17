package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification;

import fr.jegeremacartenavigo.domain.dossier.model.AlerteDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.TypeAlerte;
import fr.jegeremacartenavigo.domain.dossier.port.AlerteDashboardRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adapter JPA implementant le port domaine {@link AlerteDashboardRepository}.
 * Ne remonte que les notifications reduction/remboursement non lues
 * (cf. types vises par le bandeau d'alertes du dashboard).
 */
@Component
public class AlerteDashboardRepositoryAdapter implements AlerteDashboardRepository {

    private static final List<Notification.TypeNotification> TYPES_ALERTE = List.of(
            Notification.TypeNotification.nouvelle_reduction_disponible,
            Notification.TypeNotification.remboursement_disponible
    );

    private final NotificationJpaRepository jpa;

    public AlerteDashboardRepositoryAdapter(NotificationJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<AlerteDashboard> findUnreadAlerts(Integer idUtilisateur) {
        return jpa.findByUtilisateur_IdUtilisateurAndTypeNotificationInAndStatutLectureOrderByDateCreationDesc(
                        idUtilisateur, TYPES_ALERTE, Notification.StatutLecture.non_lu)
                .stream()
                .map(AlerteDashboardRepositoryAdapter::toDomain)
                .toList();
    }

    private static AlerteDashboard toDomain(Notification n) {
        TypeAlerte type = n.getTypeNotification() == Notification.TypeNotification.nouvelle_reduction_disponible
                ? TypeAlerte.NOUVELLE_REDUCTION_DISPONIBLE
                : TypeAlerte.REMBOURSEMENT_DISPONIBLE;
        return new AlerteDashboard(
                n.getIdNotification(),
                type,
                n.getTitre(),
                n.getContenu(),
                n.getDateCreation()
        );
    }
}
