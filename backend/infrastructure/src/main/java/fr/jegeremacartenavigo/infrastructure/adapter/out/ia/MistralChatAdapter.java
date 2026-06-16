package fr.jegeremacartenavigo.infrastructure.adapter.out.ia;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import tools.jackson.databind.ObjectMapper;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;
import fr.jegeremacartenavigo.domain.rag.port.ModeleConversationnel;
import fr.jegeremacartenavigo.infrastructure.config.RagProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Adapter de generation via l'API Mistral (https://docs.mistral.ai),
 * endpoint chat/completions. Supporte le mode bloquant et le mode streaming (SSE,
 * {@code "stream": true}). Echoue clairement si la cle est absente.
 */
@Component
public class MistralChatAdapter implements ModeleConversationnel {

    private final RestClient client;
    private final ObjectMapper objectMapper;
    private final String model;
    private final double temperature;
    private final Integer maxTokens;
    private final boolean cleAbsente;

    public MistralChatAdapter(ObjectMapper objectMapper, RagProperties properties) {
        RagProperties.Mistral mistral = properties.mistral();
        this.objectMapper = objectMapper;
        this.model = mistral.model();
        this.temperature = mistral.temperature();
        this.maxTokens = mistral.maxTokens();
        this.cleAbsente = mistral.apiKey() == null || mistral.apiKey().isBlank();
        this.client = RestClient.builder()
                .baseUrl(mistral.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + mistral.apiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String repondre(String instructionSysteme, List<TourConversation> conversation) {
        verifierCle();
        Reponse reponse = client.post()
                .uri("/chat/completions")
                .body(new Requete(model, messages(instructionSysteme, conversation), temperature, maxTokens, false))
                .retrieve()
                .body(Reponse.class);
        if (reponse == null || reponse.choices() == null || reponse.choices().isEmpty()) {
            throw new IllegalStateException("Reponse Mistral vide");
        }
        return reponse.choices().getFirst().message().content();
    }

    @Override
    public void diffuser(String instructionSysteme, List<TourConversation> conversation,
                         Consumer<String> surMorceau) {
        verifierCle();
        client.post()
                .uri("/chat/completions")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .body(new Requete(model, messages(instructionSysteme, conversation), temperature, maxTokens, true))
                .exchange((requete, reponse) -> {
                    lireFluxSse(reponse.getBody(), surMorceau);
                    return null;
                });
    }

    /** Lit un flux SSE Mistral et pousse chaque delta de contenu dans le consommateur. */
    private void lireFluxSse(java.io.InputStream corps, Consumer<String> surMorceau) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(corps, StandardCharsets.UTF_8))) {
            String ligne;
            while ((ligne = reader.readLine()) != null) {
                if (!ligne.startsWith("data:")) {
                    continue;
                }
                String charge = ligne.substring("data:".length()).trim();
                if (charge.isEmpty()) {
                    continue;
                }
                if ("[DONE]".equals(charge)) {
                    break;
                }
                MorceauStream morceau = objectMapper.readValue(charge, MorceauStream.class);
                if (morceau.choices() != null && !morceau.choices().isEmpty()) {
                    ChoixStream choix = morceau.choices().getFirst();
                    if (choix.delta() != null && choix.delta().content() != null
                            && !choix.delta().content().isEmpty()) {
                        surMorceau.accept(choix.delta().content());
                    }
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Lecture du flux Mistral interrompue", e);
        }
    }

    private void verifierCle() {
        if (cleAbsente) {
            throw new IllegalStateException(
                    "MISTRAL_API_KEY manquante : impossible de generer une reponse "
                            + "(renseigner backend/.env)");
        }
    }

    private static List<Message> messages(String instructionSysteme, List<TourConversation> conversation) {
        List<Message> messages = new ArrayList<>();
        messages.add(new Message("system", instructionSysteme));
        for (TourConversation tour : conversation) {
            String role = tour.role() == TourConversation.Role.assistant ? "assistant" : "user";
            messages.add(new Message(role, tour.contenu()));
        }
        return messages;
    }

    private record Requete(
            String model,
            List<Message> messages,
            double temperature,
            @JsonProperty("max_tokens") Integer maxTokens,
            boolean stream) {
    }

    private record Message(String role, String content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Reponse(List<Choix> choices) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Choix(Message message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MorceauStream(List<ChoixStream> choices) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ChoixStream(Delta delta) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Delta(String content) {
    }
}
