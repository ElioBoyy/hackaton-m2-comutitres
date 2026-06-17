package fr.jegeremacartenavigo.infrastructure.adapter.out.ia;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.jegeremacartenavigo.domain.rag.port.EmbeddingPort;
import fr.jegeremacartenavigo.infrastructure.config.RagProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Comparator;
import java.util.List;

/**
 * Adapter de vectorisation via l'API Voyage AI (https://docs.voyageai.com).
 *
 * <p>Distingue {@code input_type} "document" (ingestion) et "query" (recherche)
 * pour de meilleurs resultats. Echoue clairement si la cle est absente.
 */
@Component
public class VoyageEmbeddingAdapter implements EmbeddingPort {

    private final RestClient client;
    private final String model;
    private final boolean cleAbsente;

    public VoyageEmbeddingAdapter(RagProperties properties) {
        RagProperties.Voyage voyage = properties.voyage();
        this.model = voyage.embeddingModel();
        this.cleAbsente = voyage.apiKey() == null || voyage.apiKey().isBlank();
        this.client = RestClient.builder()
                .baseUrl(voyage.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + voyage.apiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public List<float[]> vectoriserDocuments(List<String> textes) {
        return appeler(textes, "document");
    }

    @Override
    public float[] vectoriserRequete(String texte) {
        return appeler(List.of(texte), "query").getFirst();
    }

    private List<float[]> appeler(List<String> textes, String inputType) {
        if (cleAbsente) {
            throw new IllegalStateException(
                    "VOYAGE_API_KEY manquante : impossible de vectoriser (renseigner backend/.env)");
        }
        Reponse reponse = client.post()
                .uri("/embeddings")
                .body(new Requete(textes, model, inputType))
                .retrieve()
                .body(Reponse.class);
        if (reponse == null || reponse.data() == null) {
            throw new IllegalStateException("Reponse Voyage vide");
        }
        // On retrie par index pour garantir le meme ordre que l'entree.
        return reponse.data().stream()
                .sorted(Comparator.comparingInt(Donnee::index))
                .map(Donnee::embedding)
                .toList();
    }

    private record Requete(
            List<String> input,
            String model,
            @JsonProperty("input_type") String inputType) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Reponse(List<Donnee> data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Donnee(int index, float[] embedding) {
    }
}
