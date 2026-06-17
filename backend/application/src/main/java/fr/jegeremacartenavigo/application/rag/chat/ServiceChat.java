package fr.jegeremacartenavigo.application.rag.chat;

import fr.jegeremacartenavigo.application.rag.MoteurRag;
import fr.jegeremacartenavigo.domain.rag.exception.ConversationIntrouvableException;
import fr.jegeremacartenavigo.domain.rag.model.AssistantReponse;
import fr.jegeremacartenavigo.domain.rag.model.ResultatEscalade;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;
import fr.jegeremacartenavigo.domain.rag.port.ConversationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.function.Consumer;

/**
 * Orchestration commune du chat (bloquant et streaming) : resolution/creation de
 * session, detection de continuite, persistance des messages, reponse via le
 * moteur RAG, et escalade automatique vers un agent humain quand l'assistant n'a
 * pas su repondre (hors corpus). Centralise la logique pour les deux modes.
 *
 * <p>Pipeline de continuite : sur une session existante, si le nouveau message
 * change de sujet (cf. {@link MoteurRag#memeSujet}), on demarre une NOUVELLE
 * session (contexte vierge) au sein de la meme conversation cote client, plutot
 * que de melanger deux sujets dans le meme fil.
 */
public final class ServiceChat {

    private static final Logger log = LoggerFactory.getLogger(ServiceChat.class);

    private final MoteurRag moteur;
    private final ConversationPort conversation;

    public ServiceChat(MoteurRag moteur, ConversationPort conversation) {
        this.moteur = moteur;
        this.conversation = conversation;
    }

    /** Chat bloquant : reponse complete en une fois. */
    public ReponseChat repondre(Integer sessionId, String message, String canal) {
        Contexte ctx = ouvrir(sessionId, canal, message);
        conversation.ajouterMessageUtilisateur(ctx.sessionId(), message);
        AssistantReponse reponse = moteur.repondre(message, ctx.historique());
        Suite suite = apres(ctx.sessionId(), message, reponse);
        return new ReponseChat(ctx.sessionId(), reponse.texte(), reponse.citations(),
                reponse.horsCorpus(), suite.escalade(), suite.referenceTicket());
    }

    /** Chat en streaming : les morceaux sont pousses dans {@code surMorceau}. */
    public ResultatChatStream diffuser(Integer sessionId, String message, String canal,
                                       Consumer<String> surMorceau) {
        Contexte ctx = ouvrir(sessionId, canal, message);
        conversation.ajouterMessageUtilisateur(ctx.sessionId(), message);
        AssistantReponse reponse = moteur.repondreEnStream(message, ctx.historique(), surMorceau);
        Suite suite = apres(ctx.sessionId(), message, reponse);
        return new ResultatChatStream(ctx.sessionId(), reponse.texte(), reponse.citations(),
                reponse.horsCorpus(), suite.escalade(), suite.referenceTicket());
    }

    private record Contexte(int sessionId, List<TourConversation> historique) {
    }

    /**
     * Resout la session a utiliser et l'historique a fournir au moteur :
     * cree une session si aucune n'est donnee, et en cree une nouvelle (contexte
     * vierge) si le message change de sujet par rapport au fil existant.
     */
    private Contexte ouvrir(Integer sessionId, String canal, String message) {
        if (sessionId == null) {
            return new Contexte(conversation.demarrer(canalOuDefaut(canal)), List.of());
        }
        if (!conversation.existe(sessionId)) {
            throw new ConversationIntrouvableException(sessionId);
        }
        List<TourConversation> historique = conversation.historique(sessionId);
        if (!historique.isEmpty() && !moteur.memeSujet(historique, message)) {
            int nouvelle = conversation.demarrer(canalOuDefaut(canal));
            log.info("Changement de sujet detecte : nouvelle session {} (depuis {})", nouvelle, sessionId);
            return new Contexte(nouvelle, List.of());
        }
        return new Contexte(sessionId, historique);
    }

    private record Suite(boolean escalade, String referenceTicket) {
    }

    private Suite apres(int id, String message, AssistantReponse reponse) {
        conversation.ajouterMessageBot(id, reponse.texte());
        if (reponse.horsCorpus()) {
            ResultatEscalade escalade = conversation.escalader(id, titreTicket(message), message);
            return new Suite(true, escalade.referenceTicket());
        }
        return new Suite(false, null);
    }

    private static String canalOuDefaut(String canal) {
        return (canal == null || canal.isBlank()) ? "web" : canal;
    }

    private static String titreTicket(String message) {
        String base = message.strip();
        return base.length() <= 120 ? base : base.substring(0, 117) + "...";
    }
}
