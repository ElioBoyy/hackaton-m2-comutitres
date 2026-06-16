package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * Resultat d'une escalade explicite.
 *
 * @param ticketCree       vrai si un ticket SAV a pu etre cree
 * @param referenceTicket  reference du ticket, sinon null
 */
public record ReponseEscalade(boolean ticketCree, String referenceTicket) implements Response {
}
