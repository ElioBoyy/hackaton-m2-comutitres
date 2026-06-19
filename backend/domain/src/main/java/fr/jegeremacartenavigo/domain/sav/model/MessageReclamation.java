package fr.jegeremacartenavigo.domain.sav.model;

import java.time.LocalDateTime;

/**
 * Un message du fil d'une reclamation. Le fil est reconstitue a partir de la
 * description initiale du ticket (premier message client) puis des entrees
 * d'historique de type {@code message_utilisateur} / {@code message_agent}.
 */
public record MessageReclamation(
        AuteurMessage auteur,
        String contenu,
        LocalDateTime date
) {
}
