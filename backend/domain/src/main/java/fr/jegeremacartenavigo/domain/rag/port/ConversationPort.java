package fr.jegeremacartenavigo.domain.rag.port;

import fr.jegeremacartenavigo.domain.rag.model.ResultatEscalade;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;

import java.util.List;

/**
 * Port de persistance d'une conversation de chat et de son escalade eventuelle
 * vers un agent humain. Implemente en infrastructure au-dessus des tables SAV
 * existantes (session_chatbot / message_chatbot / ticket_sav).
 */
public interface ConversationPort {

    /**
     * Demarre une nouvelle conversation.
     *
     * @param canal canal d'entree ("web", "mobile" ou "app")
     * @return l'identifiant de la session creee
     */
    int demarrer(String canal);

    /** Verifie qu'une session existe (sinon le use case leve une erreur metier). */
    boolean existe(int sessionId);

    /** Ajoute un message de l'utilisateur a la conversation. */
    void ajouterMessageUtilisateur(int sessionId, String contenu);

    /** Ajoute un message de l'assistant (bot) a la conversation. */
    void ajouterMessageBot(int sessionId, String contenu);

    /** Historique chronologique de la conversation (sans le message courant). */
    List<TourConversation> historique(int sessionId);

    /**
     * Marque la session comme escaladee et tente de creer un ticket SAV
     * (origine chatbot_escalade). La creation du ticket peut echouer proprement
     * si aucune categorie SAV de reference n'existe (base non seedee) : dans ce
     * cas la session est tout de meme marquee escaladee.
     *
     * @param titre       titre du ticket
     * @param description description initiale (ex: derniere question)
     */
    ResultatEscalade escalader(int sessionId, String titre, String description);
}
