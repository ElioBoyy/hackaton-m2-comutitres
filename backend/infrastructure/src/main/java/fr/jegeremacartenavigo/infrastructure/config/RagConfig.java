package fr.jegeremacartenavigo.infrastructure.config;

import fr.jegeremacartenavigo.application.rag.MoteurRag;
import fr.jegeremacartenavigo.application.rag.chat.EnvoyerMessageChatHandler;
import fr.jegeremacartenavigo.application.rag.chat.EscaladerConversationHandler;
import fr.jegeremacartenavigo.application.rag.chat.ServiceChat;
import fr.jegeremacartenavigo.application.rag.ingestion.IngererCorpusHandler;
import fr.jegeremacartenavigo.domain.rag.port.ConversationPort;
import fr.jegeremacartenavigo.domain.rag.port.EmbeddingPort;
import fr.jegeremacartenavigo.domain.rag.port.LecteurCorpus;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import fr.jegeremacartenavigo.domain.rag.port.ModeleConversationnel;
import fr.jegeremacartenavigo.domain.rag.service.ConstructeurPrompt;
import fr.jegeremacartenavigo.domain.rag.service.DecoupeurMarkdown;
import fr.jegeremacartenavigo.domain.rag.service.FiltreHorsSujet;
import fr.jegeremacartenavigo.domain.rag.service.PolitiqueAncrage;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Cable les services et handlers RAG (definis sans framework dans domain et
 * application) comme beans Spring, en leur injectant les adapters (ports) et la
 * configuration. Meme principe que {@code CqrsConfig} : la couche application
 * reste agnostique, c'est l'infrastructure qui compose.
 */
@Configuration
public class RagConfig {

    @Bean
    public DecoupeurMarkdown decoupeurMarkdown(RagProperties properties) {
        return new DecoupeurMarkdown(
                properties.decoupe().tailleCible(), properties.decoupe().chevauchement());
    }

    @Bean
    public FiltreHorsSujet filtreHorsSujet(RagProperties properties) {
        return new FiltreHorsSujet(properties.retrieval().seuilHorsSujet());
    }

    @Bean
    public PolitiqueAncrage politiqueAncrage(RagProperties properties) {
        return new PolitiqueAncrage(
                properties.retrieval().seuilSimilarite(),
                properties.retrieval().minFragmentsPertinents());
    }

    @Bean
    public ConstructeurPrompt constructeurPrompt() {
        return new ConstructeurPrompt();
    }

    @Bean
    public MoteurRag moteurRag(EmbeddingPort embedding, MagasinVecteurs magasin,
                               FiltreHorsSujet filtreHorsSujet, PolitiqueAncrage politique,
                               ConstructeurPrompt prompt, ModeleConversationnel modele,
                               RagProperties properties) {
        return new MoteurRag(embedding, magasin, filtreHorsSujet, politique, prompt, modele,
                properties.retrieval().topK());
    }

    @Bean
    public ServiceChat serviceChat(MoteurRag moteur, ConversationPort conversation) {
        return new ServiceChat(moteur, conversation);
    }

    @Bean
    public IngererCorpusHandler ingererCorpusHandler(LecteurCorpus lecteur, DecoupeurMarkdown decoupeur,
                                                     EmbeddingPort embedding, MagasinVecteurs magasin,
                                                     RagProperties properties) {
        return new IngererCorpusHandler(lecteur, decoupeur, embedding, magasin,
                properties.voyage().batchSize());
    }

    @Bean
    public EnvoyerMessageChatHandler envoyerMessageChatHandler(ServiceChat serviceChat) {
        return new EnvoyerMessageChatHandler(serviceChat);
    }

    @Bean
    public EscaladerConversationHandler escaladerConversationHandler(ConversationPort conversation) {
        return new EscaladerConversationHandler(conversation);
    }

    /**
     * Pool dedie au chat en streaming (SSE) : chaque flux occupe un thread le
     * temps de la generation. Threads daemon, fermes proprement a l'arret (Spring
     * appelle {@code shutdown()} sur les beans ExecutorService).
     */
    @Bean
    public ExecutorService ragStreamExecutor() {
        return Executors.newFixedThreadPool(8, runnable -> {
            Thread thread = new Thread(runnable, "rag-stream");
            thread.setDaemon(true);
            return thread;
        });
    }
}
