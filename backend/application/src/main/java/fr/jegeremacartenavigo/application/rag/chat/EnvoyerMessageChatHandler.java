package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;

/**
 * Traite un message de chat bloquant (endpoint synchrone). Delegue a
 * {@link ServiceChat}, qui porte toute la logique (session, persistance, reponse
 * RAG, escalade auto si hors corpus) et qui sert aussi au streaming.
 */
public final class EnvoyerMessageChatHandler
        implements CommandHandler<EnvoyerMessageChatCommand, ReponseChat> {

    private final ServiceChat serviceChat;

    public EnvoyerMessageChatHandler(ServiceChat serviceChat) {
        this.serviceChat = serviceChat;
    }

    @Override
    public ReponseChat handle(EnvoyerMessageChatCommand command) {
        return serviceChat.repondre(command.sessionId(), command.message(), command.canal());
    }
}
