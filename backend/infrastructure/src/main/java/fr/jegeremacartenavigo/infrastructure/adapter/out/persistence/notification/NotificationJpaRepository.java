package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationJpaRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUtilisateur_IdUtilisateurAndTypeNotificationInAndStatutLectureOrderByDateCreationDesc(
            Integer idUtilisateur,
            List<Notification.TypeNotification> types,
            Notification.StatutLecture statutLecture);
}
