package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.domain.sav.model.MessageReclamation;

import java.time.LocalDateTime;

public record MessageReclamationResponse(
        String auteur,
        String contenu,
        LocalDateTime date
) {
    public static MessageReclamationResponse from(MessageReclamation message) {
        return new MessageReclamationResponse(
                message.auteur().name(),
                message.contenu(),
                message.date()
        );
    }
}
