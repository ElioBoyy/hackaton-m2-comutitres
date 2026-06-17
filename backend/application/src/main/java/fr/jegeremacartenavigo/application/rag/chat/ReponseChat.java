package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.rag.model.Citation;

import java.util.List;

/**
 * Reponse a un message de chat.
 *
 * @param sessionId        session de la conversation (creee si elle n'existait pas)
 * @param texte            reponse de l'assistant (ou message de refus)
 * @param citations        sources citees (vide si hors corpus)
 * @param horsCorpus       vrai si la question n'etait pas couverte par le corpus
 * @param escalade         vrai si la conversation a ete escaladee vers un humain
 * @param referenceTicket  reference du ticket SAV cree, sinon null
 */
public record ReponseChat(
        int sessionId,
        String texte,
        List<Citation> citations,
        boolean horsCorpus,
        boolean escalade,
        String referenceTicket
) implements Response {
}
