package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.domain.rag.model.Citation;

import java.util.List;

/**
 * Metadonnees renvoyees a la fin d'un chat en streaming (le texte a deja ete
 * pousse morceau par morceau ; il est rappele ici en entier pour le client).
 */
public record ResultatChatStream(
        int sessionId,
        String texte,
        List<Citation> citations,
        boolean horsCorpus,
        boolean escalade,
        String referenceTicket
) {
}
