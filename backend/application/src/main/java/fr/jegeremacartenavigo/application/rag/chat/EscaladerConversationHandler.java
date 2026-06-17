package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.rag.exception.ConversationIntrouvableException;
import fr.jegeremacartenavigo.domain.rag.model.ResultatEscalade;
import fr.jegeremacartenavigo.domain.rag.port.ConversationPort;

/** Escalade explicite d'une conversation vers un agent humain. */
public final class EscaladerConversationHandler
        implements CommandHandler<EscaladerConversationCommand, ReponseEscalade> {

    private static final String MOTIF_DEFAUT = "Demande de mise en relation avec un conseiller";

    private final ConversationPort conversation;

    public EscaladerConversationHandler(ConversationPort conversation) {
        this.conversation = conversation;
    }

    @Override
    public ReponseEscalade handle(EscaladerConversationCommand command) {
        if (!conversation.existe(command.sessionId())) {
            throw new ConversationIntrouvableException(command.sessionId());
        }
        String motif = (command.motif() == null || command.motif().isBlank())
                ? MOTIF_DEFAUT : command.motif().strip();
        ResultatEscalade resultat = conversation.escalader(command.sessionId(), motif, motif);
        return new ReponseEscalade(resultat.ticketCree(), resultat.referenceTicket());
    }
}
