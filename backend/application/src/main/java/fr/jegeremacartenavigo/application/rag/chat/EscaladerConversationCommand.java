package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Escalade explicite d'une conversation vers un agent humain (l'utilisateur
 * demande a parler a quelqu'un), independamment du fait que l'IA ait su repondre.
 *
 * @param sessionId session a escalader (obligatoire)
 * @param motif     motif libre de la demande (optionnel)
 */
public record EscaladerConversationCommand(
        @NotNull Integer sessionId,
        @Size(max = 500) String motif
) implements Command<ReponseEscalade> {
}
