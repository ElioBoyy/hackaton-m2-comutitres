package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

/**
 * Alerte : notification de type
 * reduction/remboursement, non lue, rattachee a l'utilisateur connecte.
 */
public record AlerteDashboard(
        Integer idNotification,
        TypeAlerte type,
        String titre,
        String contenu,
        LocalDateTime dateCreation
) {
}
