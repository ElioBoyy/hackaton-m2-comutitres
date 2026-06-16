package fr.jegeremacartenavigo.domain.rag.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/** Levee quand on reference une session de conversation qui n'existe pas. */
public class ConversationIntrouvableException extends DomainException {

    public ConversationIntrouvableException(int sessionId) {
        super("Conversation introuvable : " + sessionId);
    }
}
