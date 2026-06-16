package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationJpaRepository extends JpaRepository<Notification, Integer> {
}
