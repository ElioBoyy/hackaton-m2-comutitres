package fr.jegeremacartenavigo.infrastructure.adapter.in.web.rag;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.rag.chat.EnvoyerMessageChatCommand;
import fr.jegeremacartenavigo.application.rag.chat.EscaladerConversationCommand;
import fr.jegeremacartenavigo.application.rag.chat.ReponseChat;
import fr.jegeremacartenavigo.application.rag.chat.ReponseEscalade;
import fr.jegeremacartenavigo.application.rag.chat.ResultatChatStream;
import fr.jegeremacartenavigo.application.rag.chat.ServiceChat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.concurrent.ExecutorService;

/**
 * Chat conversationnel avec l'assistant (multi-tours, memoire en base).
 *
 * <ul>
 *   <li>{@code POST /api/chat} : reponse complete (bloquant, via le bus CQRS).</li>
 *   <li>{@code POST /api/chat/stream} : reponse en streaming SSE (les morceaux
 *       arrivent au fil de l'eau ; un evenement final porte les citations et le
 *       statut d'escalade). Le streaming sort du bus CQRS (qui est requete/reponse).</li>
 *   <li>{@code POST /api/chat/escalade} : escalade explicite vers un humain.</li>
 * </ul>
 *
 * Si l'assistant ne sait pas repondre (hors corpus / hors sujet), la conversation
 * est escaladee automatiquement vers un agent humain (ticket SAV).
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final CommandBus commandBus;
    private final ServiceChat serviceChat;
    private final ExecutorService streamExecutor;

    public ChatController(CommandBus commandBus, ServiceChat serviceChat,
                          @Qualifier("ragStreamExecutor") ExecutorService streamExecutor) {
        this.commandBus = commandBus;
        this.serviceChat = serviceChat;
        this.streamExecutor = streamExecutor;
    }

    @PostMapping
    public ReponseChat envoyer(@RequestBody MessageRequete requete) {
        return commandBus.send(new EnvoyerMessageChatCommand(
                requete.sessionId(), requete.message(), requete.canal()));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter diffuser(@RequestBody MessageRequete requete) {
        SseEmitter emitter = new SseEmitter(180_000L);
        streamExecutor.execute(() -> {
            try {
                ResultatChatStream resultat = serviceChat.diffuser(
                        requete.sessionId(), requete.message(), requete.canal(),
                        morceau -> envoyer(emitter, "delta", new Morceau(morceau)));
                envoyer(emitter, "fin", resultat);
                emitter.complete();
            } catch (Exception e) {
                log.warn("Echec du chat en streaming : {}", e.getMessage());
                envoyerSansEcho(emitter, "erreur", Map.of("message", messageErreur(e)));
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    @PostMapping("/escalade")
    public ReponseEscalade escalader(@RequestBody EscaladeRequete requete) {
        return commandBus.send(new EscaladerConversationCommand(requete.sessionId(), requete.motif()));
    }

    private static void envoyer(SseEmitter emitter, String evenement, Object donnee) {
        try {
            emitter.send(SseEmitter.event().name(evenement).data(donnee, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static void envoyerSansEcho(SseEmitter emitter, String evenement, Object donnee) {
        try {
            emitter.send(SseEmitter.event().name(evenement).data(donnee, MediaType.APPLICATION_JSON));
        } catch (IOException ignore) {
            // le client s'est probablement deconnecte : rien a faire
        }
    }

    private static String messageErreur(Exception e) {
        return e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
    }

    /**
     * @param sessionId session existante, ou null pour en demarrer une nouvelle
     * @param message   message de l'utilisateur
     * @param canal     "web" (defaut), "mobile" ou "app"
     */
    public record MessageRequete(Integer sessionId, String message, String canal) {
    }

    public record EscaladeRequete(Integer sessionId, String motif) {
    }

    /** Un morceau de texte streame. */
    public record Morceau(String t) {
    }
}
