package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Envoie un message dans une conversation de chat avec l'assistant.
 *
 * @param sessionId session existante, ou null pour en demarrer une nouvelle
 * @param message   message de l'utilisateur (obligatoire)
 * @param canal     canal d'entree ("web", "mobile", "app") ; "web" par defaut
 */
public record EnvoyerMessageChatCommand(
        Integer sessionId,
        @NotBlank @Size(max = 2000) String message,
        String canal
) implements Command<ReponseChat> {
}
